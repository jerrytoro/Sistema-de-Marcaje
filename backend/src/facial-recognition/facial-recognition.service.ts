import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// ✅ Configurar TensorFlow ANTES de face-api
import '@tensorflow/tfjs-backend-cpu';
import * as tf from '@tensorflow/tfjs';
tf.setBackend('cpu');

// ✅ Importar face-api desde archivo ESM
import * as faceapi from 'face-api.js';
import * as canvas from 'canvas';
import * as path from 'path';
// Configurar canvas para face-api
const { Canvas, Image, ImageData } = canvas;
// @ts-ignore
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

@Injectable()
export class FacialRecognitionService {
  private modelsLoaded = false;

  constructor(private prisma: PrismaService) {
    this.inicializar();
  }

  private async inicializar() {
    try {
      await tf.ready();
      console.log('✅ TensorFlow backend:', tf.getBackend());
      await this.cargarModelos();
    } catch (error) {
      console.error('❌ Error en inicialización:', error);
    }
  }

  private async cargarModelos() {
    if (this.modelsLoaded) return;

    try {
    const MODEL_URL = path.join(process.cwd(), 'models');
    
    console.log('📂 Intentando cargar modelos desde:', MODEL_URL);

    // ✅ Cargar con loadFromDisk
    await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODEL_URL);
    console.log('✅ ssdMobilenetv1 cargado');
    
    await faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_URL);
    console.log('✅ faceLandmark68Net cargado');
    
    await faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_URL);
    console.log('✅ faceRecognitionNet cargado');

    this.modelsLoaded = true;
    console.log('✅ Todos los modelos cargados correctamente');
  } catch (error) {
    console.error('❌ Error detallado al cargar modelos:', error);
    throw new Error('No se pudieron cargar los modelos de reconocimiento facial');
  }
  }

  private async detectarRostro(buffer: Buffer): Promise<Float32Array | null> {
    try {
      const img = await canvas.loadImage(buffer);
      const detecciones = await faceapi
        .detectSingleFace(img as any)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detecciones) {
        return null;
      }

      return detecciones.descriptor;
    } catch (error) {
      console.error('Error al detectar rostro:', error);
      return null;
    }
  }

  async registrarDatosFaciales(
    funcionarioId: number,
    foto: Express.Multer.File,
  ) {
    if (!foto) {
      throw new BadRequestException('No se proporcionó ninguna foto');
    }

    const funcionario = await this.prisma.funcionario.findUnique({
      where: { id: funcionarioId },
    });

    if (!funcionario) {
      throw new BadRequestException('Funcionario no encontrado');
    }

    const descriptor = await this.detectarRostro(foto.buffer);

    if (!descriptor) {
      throw new BadRequestException(
        'No se detectó ningún rostro en la imagen',
      );
    }

    await this.prisma.registroFacial.create({
      data: {
        funcionarioId,
        facialData: JSON.stringify(Array.from(descriptor)),
        metadata: {
          capturaNumero: 1,
          fechaCaptura: new Date().toISOString(),
          metodo: 'registro-simple',
        },
      } as any,
    });

    await this.prisma.funcionario.update({
      where: { id: funcionarioId },
      data: { facialDataRegistered: true },
    });

    return {
      message: 'Registro facial completado exitosamente',
      funcionarioId,
      registros: 1,
    };
  }

  // async registrarMultiple(
  //   funcionarioId: number,
  //   fotos: Express.Multer.File[],
  //   metadata: Record<string, any>,
  // ) {
  //   if (!fotos || fotos.length !== 5) {
  //     throw new BadRequestException(
  //       `Se requieren exactamente 5 fotos, se recibieron ${fotos?.length || 0}`,
  //     );
  //   }

  //   const funcionario = await this.prisma.funcionario.findUnique({
  //     where: { id: funcionarioId },
  //   });

  //   if (!funcionario) {
  //     throw new BadRequestException('Funcionario no encontrado');
  //   }

  //   await this.prisma.registroFacial.deleteMany({
  //     where: { funcionarioId },
  //   });

  //   const registrosCreados: any[] = [];

  //   for (let i = 0; i < fotos.length; i++) {
  //     const foto = fotos[i];
  //     const instruccion = metadata[`instruccion${i + 1}`] || `Foto ${i + 1}`;

  //     const descriptor = await this.detectarRostro(foto.buffer);

  //     if (!descriptor) {
  //       throw new BadRequestException(
  //         `No se detectó rostro en la foto ${i + 1} (${instruccion})`,
  //       );
  //     }

  //     const registro = await this.prisma.registroFacial.create({
  //       data: {
  //         funcionarioId,
  //         facialData: JSON.stringify(Array.from(descriptor)),
  //         metadata: {
  //           instruccion,
  //           capturaNumero: i + 1,
  //           fechaCaptura: new Date().toISOString(),
  //           metodo: 'registro-multiple',
  //         },
  //       } as any,
  //     });

  //     registrosCreados.push(registro);
  //   }

  //   await this.prisma.funcionario.update({
  //     where: { id: funcionarioId },
  //     data: { facialDataRegistered: true },
  //   });

  //   return {
  //     message: 'Registro facial múltiple completado exitosamente',
  //     funcionarioId,
  //     registrosCreados: registrosCreados.length,
  //     detalles: registrosCreados.map((r: any, i: number) => ({
  //       id: r.id,
  //       instruccion: metadata[`instruccion${i + 1}`],
  //     })),
  //   };
  // }
  // En facial-recognition.service.ts
// Busca el método registrarMultiple y reemplázalo con este:

async registrarMultiple(
  funcionarioId: number,
  fotos: Express.Multer.File[],
  metadata: Record<string, any>,
) {
  console.log('🔍 ========== INICIO REGISTRO MÚLTIPLE ==========');
  console.log('📝 Funcionario ID:', funcionarioId);
  console.log('📝 Cantidad de fotos recibidas:', fotos?.length);
  console.log('📝 Metadata recibida:', metadata);

  try {
    if (!fotos || fotos.length !== 5) {
      const error = `Se requieren exactamente 5 fotos, se recibieron ${fotos?.length || 0}`;
      console.error('❌ ERROR DE VALIDACIÓN:', error);
      throw new BadRequestException(error);
    }

    console.log('✅ Validación de cantidad de fotos: OK');

    const funcionario = await this.prisma.funcionario.findUnique({
      where: { id: funcionarioId },
    });

    console.log('📝 Funcionario encontrado:', funcionario ? 'SI' : 'NO');

    if (!funcionario) {
      console.error('❌ ERROR: Funcionario no encontrado con ID:', funcionarioId);
      throw new BadRequestException('Funcionario no encontrado');
    }

    console.log('✅ Funcionario encontrado:', funcionario.nombre, funcionario.apellido);

    console.log('🗑️ Eliminando registros anteriores...');
    await this.prisma.registroFacial.deleteMany({
      where: { funcionarioId },
    });
    console.log('✅ Registros anteriores eliminados');

    const registrosCreados: any[] = [];

    for (let i = 0; i < fotos.length; i++) {
      const foto = fotos[i];
      const instruccion = metadata[`instruccion${i + 1}`] || `Foto ${i + 1}`;

      console.log(`\n📸 Procesando foto ${i + 1}/5`);
      console.log('  - Instrucción:', instruccion);
      console.log('  - Tamaño:', foto.size, 'bytes');
      console.log('  - Tipo:', foto.mimetype);

      console.log('  - Detectando rostro...');
      const descriptor = await this.detectarRostro(foto.buffer);

      if (!descriptor) {
        const errorMsg = `No se detectó rostro en la foto ${i + 1} (${instruccion})`;
        console.error(`  ❌ ${errorMsg}`);
        throw new BadRequestException(errorMsg);
      }

      console.log('  ✅ Rostro detectado, descriptor generado');
      console.log('  - Longitud del descriptor:', descriptor.length);

      console.log('  - Guardando en BD...');
      const registro = await this.prisma.registroFacial.create({
        data: {
          funcionarioId,
          facialData: JSON.stringify(Array.from(descriptor)),
          metadata: {
            instruccion,
            capturaNumero: i + 1,
            fechaCaptura: new Date().toISOString(),
            metodo: 'registro-multiple',
          },
        } as any,
      });

      console.log('  ✅ Registro guardado en BD con ID:', registro.id);
      registrosCreados.push(registro);
    }

    console.log('\n📝 Actualizando flag facialDataRegistered...');
    await this.prisma.funcionario.update({
      where: { id: funcionarioId },
      data: { facialDataRegistered: true },
    });

    console.log('✅ ========== REGISTRO MÚLTIPLE COMPLETADO ==========\n');

    return {
      message: 'Registro facial múltiple completado exitosamente',
      funcionarioId,
      registrosCreados: registrosCreados.length,
      detalles: registrosCreados.map((r: any, i: number) => ({
        id: r.id,
        instruccion: metadata[`instruccion${i + 1}`],
      })),
    };
  } catch (error) {
    console.error('\n❌ ========== ERROR EN REGISTRO MÚLTIPLE ==========');
    console.error('❌ Tipo de error:', error.constructor.name);
    console.error('❌ Mensaje:', error.message);
    console.error('❌ Stack:', error.stack);
    console.error('❌ ================================================\n');
    throw error;
  }
}
  async verificarYMarcar(foto: Express.Multer.File) {
    if (!foto) {
      return {
        success: false,
        message: 'No se proporcionó ninguna foto',
      };
    }

    const descriptorEntrada = await this.detectarRostro(foto.buffer);

    if (!descriptorEntrada) {
      return {
        success: false,
        message: 'No se detectó ningún rostro en la imagen',
      };
    }

    const todosLosRegistros = await this.prisma.registroFacial.findMany({
      include: {
        funcionario: {
          include: {
            usuario: true,
          },
        },
      },
    });

    if (todosLosRegistros.length === 0) {
      return {
        success: false,
        message: 'No hay funcionarios registrados con datos faciales',
      };
    }

    let mejorCoincidencia: any = null;
    let mejorDistancia = Infinity;
    const UMBRAL = 0.6;

    for (const registro of todosLosRegistros) {
      try {
        const descriptorGuardado = new Float32Array(
          JSON.parse(registro.facialData),
        );

        const distancia = faceapi.euclideanDistance(
          descriptorEntrada,
          descriptorGuardado,
        );

        if (distancia < mejorDistancia) {
          mejorDistancia = distancia;
          mejorCoincidencia = registro;
        }
      } catch (error) {
        console.error(`Error al comparar con registro ${registro.id}:`, error);
      }
    }

    if (!mejorCoincidencia || mejorDistancia > UMBRAL) {
      return {
        success: false,
        message: 'Rostro no reconocido',
        distancia: mejorDistancia,
        umbral: UMBRAL,
      };
    }

    const confianza = Math.round((1 - mejorDistancia) * 100);
    const funcionario = mejorCoincidencia.funcionario;

    const tipoMarcaje = await this.determinarTipoMarcaje(funcionario.id);

    const asistencia = await this.prisma.asistencia.create({
      data: {
        funcionarioId: funcionario.id,
        fecha: new Date(),
        tipoMarcaje: tipoMarcaje,
        metodoMarcaje: 'FACIAL',
      } as any,
    });

    await this.calcularAtraso(asistencia.id);

    return {
      success: true,
      message: `Bienvenido ${funcionario.nombre} ${funcionario.apellido}`,
      asistencia: {
        id: asistencia.id,
        tipo: tipoMarcaje,
        hora: asistencia.fecha,
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
  }

  private async determinarTipoMarcaje(funcionarioId: number): Promise<string> {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const marcajesHoy = await this.prisma.asistencia.findMany({
      where: {
        funcionarioId,
        fecha: {
          gte: hoy,
        },
      },
      orderBy: {
        fecha: 'asc',
      },
    });

    const tiposMarcados = marcajesHoy.map((m) => m.tipoMarcaje);

    if (!tiposMarcados.includes('INGRESO_MANANA')) {
      return 'INGRESO_MANANA';
    }
    if (!tiposMarcados.includes('SALIDA_DESCANSO')) {
      return 'SALIDA_DESCANSO';
    }
    if (!tiposMarcados.includes('INGRESO_TARDE')) {
      return 'INGRESO_TARDE';
    }
    if (!tiposMarcados.includes('SALIDA_FINAL')) {
      return 'SALIDA_FINAL';
    }

    return 'INGRESO_MANANA';
  }

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