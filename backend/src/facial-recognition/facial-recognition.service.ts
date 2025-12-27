import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TelegramService } from '../notifications/telegram.service';

@Injectable()
export class FacialRecognitionService {
  constructor(
    private prisma: PrismaService,
    private telegramService: TelegramService,
  ) {
    console.log('🔧 FacialRecognitionService inicializado (modo descriptores)');
  }

  /**
   * Registrar descriptores faciales enviados desde el frontend
   */
  async registrarDescriptores(
    funcionarioId: number,
    descriptores: { descriptor: number[]; instruccion: string }[],
  ) {
    console.log('\n🔍 ========== INICIO REGISTRO DE DESCRIPTORES ==========');
    console.log('📝 Funcionario ID:', funcionarioId);
    console.log('📝 Cantidad de descriptores recibidos:', descriptores.length);

    try {
      // Validar cantidad
      if (!descriptores || descriptores.length !== 5) {
        throw new BadRequestException(
          `Se requieren exactamente 5 descriptores, se recibieron ${descriptores?.length || 0}`,
        );
      }

      // Buscar funcionario
      const funcionario = await this.prisma.funcionario.findUnique({
        where: { id: funcionarioId },
      });

      if (!funcionario) {
        throw new BadRequestException('Funcionario no encontrado');
      }

      console.log('✅ Funcionario encontrado:', funcionario.nombre, funcionario.apellido);

      // Eliminar registros anteriores
      console.log('🗑️ Eliminando registros anteriores...');
      await this.prisma.registroFacial.deleteMany({
        where: { funcionarioId },
      });
      console.log('✅ Registros anteriores eliminados');

      // Guardar cada descriptor
      const registrosCreados: any[] = [];

      for (let i = 0; i < descriptores.length; i++) {
        const { descriptor, instruccion } = descriptores[i];

        console.log(`\n📸 Guardando descriptor ${i + 1}/5`);
        console.log('  📝 Instrucción:', instruccion);
        console.log('  📊 Longitud del descriptor:', descriptor.length);

        // Validar que el descriptor tenga 128 valores (estándar de face-api.js)
        if (descriptor.length !== 128) {
          throw new BadRequestException(
            `Descriptor ${i + 1} inválido. Se esperaban 128 valores, se recibieron ${descriptor.length}`,
          );
        }

        const registro = await this.prisma.registroFacial.create({
          data: {
            funcionarioId,
            facialData: JSON.stringify(descriptor),
            metadata: {
              instruccion,
              capturaNumero: i + 1,
              fechaCaptura: new Date().toISOString(),
              metodo: 'registro-frontend',
            },
          } as any,
        });

        console.log('  ✅ Descriptor guardado con ID:', registro.id);
        registrosCreados.push(registro);
      }

      // Marcar como registrado
      await this.prisma.funcionario.update({
        where: { id: funcionarioId },
        data: { facialDataRegistered: true },
      });

      console.log('✅ ========== REGISTRO DE DESCRIPTORES COMPLETADO ==========\n');

      return {
        success: true,
        message: 'Registro facial completado exitosamente',
        funcionarioId,
        registrosCreados: registrosCreados.length,
        detalles: registrosCreados.map((r: any, i: number) => ({
          id: r.id,
          instruccion: descriptores[i].instruccion,
        })),
      };
    } catch (error) {
      console.error('\n❌ ERROR EN REGISTRO DE DESCRIPTORES');
      console.error('❌ Mensaje:', error.message);
      throw error;
    }
  }

  /**
   * Verificar descriptor facial y marcar asistencia
   */
  async verificarDescriptor(descriptor: number[]) {
    console.log('\n🔍 ========== VERIFICACIÓN DE DESCRIPTOR ==========');

    try {
      // Validar descriptor
      console.log('📝 Paso 1: Validando descriptor...');
      if (!descriptor || descriptor.length !== 128) {
        throw new BadRequestException(
          `Descriptor inválido. Se esperaban 128 valores, se recibieron ${descriptor?.length || 0}`,
        );
      }
      console.log('✅ Descriptor válido: 128 valores');

      // Obtener todos los registros faciales
      console.log('📝 Paso 2: Consultando registros faciales...');
      const todosLosRegistros = await this.prisma.registroFacial.findMany({
        include: {
          funcionario: {
            include: {
              usuario: true,
            },
          },
        },
      });
      console.log(`✅ Registros encontrados: ${todosLosRegistros.length}`);

      if (todosLosRegistros.length === 0) {
        console.log('❌ No hay registros faciales en la base de datos');
        return {
          success: false,
          message: 'No hay funcionarios registrados con datos faciales',
        };
      }

      // Buscar la mejor coincidencia
      console.log('📝 Paso 3: Comparando descriptores...');
      let mejorCoincidencia: any = null;
      let mejorDistancia = Infinity;
      const UMBRAL = 0.6;

      for (const registro of todosLosRegistros) {
        try {
          const descriptorGuardado = JSON.parse(registro.facialData);
          const distancia = this.calcularDistanciaEuclidiana(descriptor, descriptorGuardado);

          if (distancia < mejorDistancia) {
            mejorDistancia = distancia;
            mejorCoincidencia = registro;
          }
        } catch (error) {
          console.error(`❌ Error al comparar con registro ${registro.id}:`, error.message);
        }
      }

      console.log(`📊 Mejor distancia: ${mejorDistancia.toFixed(4)}, Umbral: ${UMBRAL}`);

      if (!mejorCoincidencia || mejorDistancia > UMBRAL) {
        console.log('❌ Rostro no reconocido. Distancia:', mejorDistancia);
        return {
          success: false,
          message: 'Rostro no reconocido',
          distancia: mejorDistancia,
          umbral: UMBRAL,
        };
      }

      const confianza = Math.round((1 - mejorDistancia) * 100);
      const funcionario = mejorCoincidencia.funcionario;

      console.log('✅ Rostro reconocido:', funcionario.nombre, funcionario.apellido);
      console.log('📊 Confianza:', confianza + '%');

      // Determinar tipo de marcaje
      console.log('📝 Paso 4: Determinando tipo de marcaje...');
      const tipoMarcaje = await this.determinarTipoMarcaje(funcionario.id);
      console.log('✅ Tipo de marcaje:', tipoMarcaje);

      // Registrar asistencia
      console.log('📝 Paso 5: Registrando asistencia...');
      const fechaMarcaje = new Date();
      const asistencia = await this.prisma.asistencia.create({
        data: {
          funcionarioId: funcionario.id,
          fecha: fechaMarcaje,
          horaMarcaje: fechaMarcaje,
          tipoMarcaje: tipoMarcaje,
          metodoMarcaje: 'FACIAL',
        } as any,
      });
      console.log('✅ Asistencia creada con ID:', asistencia.id);

      // Calcular atraso
      console.log('📝 Paso 6: Calculando atraso...');
      await this.calcularAtraso(asistencia.id);
      console.log('✅ Atraso calculado');

      // Obtener asistencia actualizada
      const asistenciaFinal = await this.prisma.asistencia.findUnique({
        where: { id: asistencia.id },
      });

      if (!asistenciaFinal) {
        throw new Error('No se pudo recuperar la asistencia');
      }

      // Enviar notificación a Telegram (si está vinculado)
      if (funcionario.telegramChatId) {
        console.log('📱 Enviando notificación a Telegram...');
        try {
          await this.telegramService.notificarMarcajeExitoso({
            chatId: funcionario.telegramChatId,
            funcionario: `${funcionario.nombre} ${funcionario.apellido}`,
            tipoMarcaje: asistenciaFinal.tipoMarcaje,
            hora: asistenciaFinal.horaMarcaje.toLocaleTimeString('es-ES', {
              hour: '2-digit',
              minute: '2-digit',
            }),
            minutosTardanza: asistenciaFinal.minutosTardanza || 0,
          });
          console.log('✅ Notificación enviada a Telegram');
        } catch (error) {
          console.error('❌ Error al enviar notificación a Telegram:', error.message);
          // No lanzamos el error para que el marcaje siga funcionando aunque falle Telegram
        }
      } else {
        console.log('ℹ️  Funcionario no tiene Telegram vinculado, notificación omitida');
      }

      console.log('✅ ========== VERIFICACIÓN COMPLETADA ==========\n');

      return {
        success: true,
        message: `Bienvenido ${funcionario.nombre} ${funcionario.apellido}`,
        asistencia: {
          id: asistenciaFinal.id,
          fecha: asistenciaFinal.fecha,
          tipoMarcaje: asistenciaFinal.tipoMarcaje,
          minutosTardanza: asistenciaFinal.minutosTardanza || 0,
        },
        funcionario: {
          id: funcionario.id,
          nombre: funcionario.nombre,
          apellido: funcionario.apellido,
          cargo: funcionario.cargo,
        },
        confianza,
        distancia: mejorDistancia,
        umbral: UMBRAL,
      };
    } catch (error) {
      console.error('\n❌ ========== ERROR EN VERIFICACIÓN ==========');
      console.error('❌ Tipo de error:', error.constructor.name);
      console.error('❌ Mensaje:', error.message);
      console.error('❌ Stack:', error.stack);
      console.error('❌ ==========================================\n');
      throw error;
    }
  }

  /**
   * Calcular distancia euclidiana entre dos descriptores
   */
  private calcularDistanciaEuclidiana(desc1: number[], desc2: number[]): number {
    let suma = 0;
    for (let i = 0; i < desc1.length; i++) {
      const diferencia = desc1[i] - desc2[i];
      suma += diferencia * diferencia;
    }
    return Math.sqrt(suma);
  }

  /**
   * Determinar tipo de marcaje según marcajes del día
   */
  private async determinarTipoMarcaje(funcionarioId: number): Promise<string> {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const marcajesHoy = await this.prisma.asistencia.findMany({
      where: { funcionarioId, fecha: { gte: hoy } },
      orderBy: { fecha: 'asc' },
    });

    const tiposMarcados = marcajesHoy.map((m) => m.tipoMarcaje);

    if (!tiposMarcados.includes('INGRESO_MANANA')) return 'INGRESO_MANANA';
    if (!tiposMarcados.includes('SALIDA_DESCANSO')) return 'SALIDA_DESCANSO';
    if (!tiposMarcados.includes('INGRESO_TARDE')) return 'INGRESO_TARDE';
    if (!tiposMarcados.includes('SALIDA_FINAL')) return 'SALIDA_FINAL';

    return 'INGRESO_MANANA';
  }

  /**
   * Calcular atraso
   */
  private async calcularAtraso(asistenciaId: number) {
    const asistencia = await this.prisma.asistencia.findUnique({
      where: { id: asistenciaId },
    });

    if (!asistencia) return;

    const config = await this.prisma.configuracionHorario.findFirst({
      where: { tipoMarcaje: asistencia.tipoMarcaje },
    });

    if (!config) return;

    const horaAsistencia = new Date(asistencia.fecha);
    const [horaConfig, minConfig] = config.horaProgramada.split(':').map(Number);

    const horaProgramada = new Date(asistencia.fecha);
    horaProgramada.setHours(horaConfig, minConfig, 0, 0);

    const horaLimite = new Date(horaProgramada);
    horaLimite.setMinutes(horaLimite.getMinutes() + config.toleranciaMinutos);

    if (horaAsistencia > horaLimite) {
      const minutosTardanza = Math.floor(
        (horaAsistencia.getTime() - horaLimite.getTime()) / (1000 * 60),
      );

      await this.prisma.asistencia.update({
        where: { id: asistenciaId },
        data: { minutosTardanza } as any,
      });
    }
  }

  /**
   * Obtener estado del registro facial
   */
  async obtenerEstado(funcionarioId: number) {
    const registros = await this.prisma.registroFacial.findMany({
      where: { funcionarioId },
      orderBy: { createdAt: 'desc' },
    });

    return {
      funcionarioId,
      registrado: registros.length > 0,
      cantidadRegistros: registros.length,
      ultimoRegistro: registros[0]?.createdAt || null,
      registros: registros.map((r: any) => ({
        id: r.id,
        metadata: r.metadata,
        fecha: r.createdAt,
      })),
    };
  }

  /**
   * Eliminar registros faciales
   */
  async eliminarRegistros(funcionarioId: number) {
    const resultado = await this.prisma.registroFacial.deleteMany({
      where: { funcionarioId },
    });

    await this.prisma.funcionario.update({
      where: { id: funcionarioId },
      data: { facialDataRegistered: false },
    });

    return {
      message: 'Registros faciales eliminados',
      eliminados: resultado.count,
    };
  }
}