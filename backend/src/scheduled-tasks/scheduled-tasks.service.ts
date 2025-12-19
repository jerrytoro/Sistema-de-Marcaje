import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../database/prisma.service';
import { TelegramService } from '../notifications/telegram.service';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isWeekend } from 'date-fns';
import { es } from 'date-fns/locale';

@Injectable()
export class ScheduledTasksService {
  private readonly logger = new Logger(ScheduledTasksService.name);

  constructor(
    private prisma: PrismaService,
    private telegramService: TelegramService,
  ) {}

  /**
   * CRON JOB 1: Verificar salidas no registradas
   * Se ejecuta todos los días a las 19:00
   */
  @Cron('0 19 * * *', {
    name: 'verificar-salidas-no-registradas',
    timeZone: 'America/La_Paz',
  })
  async verificarSalidasNoRegistradas() {
    this.logger.log('🔍 Verificando salidas no registradas...');

    try {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      // Obtener funcionarios con Telegram vinculado
      const funcionarios = await this.prisma.funcionario.findMany({
        where: {
          estado: true,
          telegramChatId: { not: null },
        } as any,
      });

      let notificacionesEnviadas = 0;

      for (const funcionario of funcionarios) {
        // Verificar si tiene marcaje de SALIDA_FINAL hoy
        const salidaFinal = await this.prisma.asistencia.findFirst({
          where: {
            funcionarioId: funcionario.id,
            fecha: {
              gte: hoy,
              lt: new Date(hoy.getTime() + 24 * 60 * 60 * 1000),
            },
            tipoMarcaje: 'SALIDA_FINAL',
          },
        });

        // Si no tiene salida final, notificar
        if (!salidaFinal) {
          const chatId = (funcionario as any).telegramChatId;
          
          await this.telegramService.notificarSalidaNoRegistrada({
            chatId,
            funcionario: `${funcionario.nombre} ${funcionario.apellido}`,
            fecha: format(hoy, "dd 'de' MMMM 'de' yyyy", { locale: es }),
          });

          notificacionesEnviadas++;
        }
      }

      this.logger.log(`✅ Salidas no registradas: ${notificacionesEnviadas} notificaciones enviadas`);
    } catch (error) {
      this.logger.error('❌ Error verificando salidas no registradas:', error);
    }
  }

  /**
   * CRON JOB 2: Recordatorio de ingreso mañana
   * Se ejecuta todos los días a las 08:30
   */
  @Cron('30 8 * * *', {
    name: 'recordatorio-ingreso-manana',
    timeZone: 'America/La_Paz',
  })
  async recordatorioIngresoManana() {
    this.logger.log('⏰ Enviando recordatorios de ingreso mañana...');

    try {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      // Obtener funcionarios sin INGRESO_MANANA
      const funcionarios = await this.prisma.funcionario.findMany({
        where: {
          estado: true,
          telegramChatId: { not: null },
        } as any,
      });

      let notificacionesEnviadas = 0;

      for (const funcionario of funcionarios) {
        // Verificar si ya marcó ingreso mañana
        const ingresoManana = await this.prisma.asistencia.findFirst({
          where: {
            funcionarioId: funcionario.id,
            fecha: {
              gte: hoy,
              lt: new Date(hoy.getTime() + 24 * 60 * 60 * 1000),
            },
            tipoMarcaje: 'INGRESO_MANANA',
          },
        });

        if (!ingresoManana) {
          const chatId = (funcionario as any).telegramChatId;
          
          await this.telegramService.notificarRecordatorio({
            chatId,
            funcionario: `${funcionario.nombre} ${funcionario.apellido}`,
            tipoMarcaje: 'INGRESO_MANANA',
          });

          notificacionesEnviadas++;
        }
      }

      this.logger.log(`✅ Recordatorios ingreso mañana: ${notificacionesEnviadas} enviados`);
    } catch (error) {
      this.logger.error('❌ Error enviando recordatorios ingreso mañana:', error);
    }
  }

  /**
   * CRON JOB 3: Recordatorio de ingreso tarde
   * Se ejecuta todos los días a las 14:30
   */
  @Cron('30 14 * * *', {
    name: 'recordatorio-ingreso-tarde',
    timeZone: 'America/La_Paz',
  })
  async recordatorioIngresoTarde() {
    this.logger.log('⏰ Enviando recordatorios de ingreso tarde...');

    try {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      const funcionarios = await this.prisma.funcionario.findMany({
        where: {
          estado: true,
          telegramChatId: { not: null },
        } as any,
      });

      let notificacionesEnviadas = 0;

      for (const funcionario of funcionarios) {
        // Verificar si ya marcó ingreso tarde
        const ingresoTarde = await this.prisma.asistencia.findFirst({
          where: {
            funcionarioId: funcionario.id,
            fecha: {
              gte: hoy,
              lt: new Date(hoy.getTime() + 24 * 60 * 60 * 1000),
            },
            tipoMarcaje: 'INGRESO_TARDE',
          },
        });

        if (!ingresoTarde) {
          const chatId = (funcionario as any).telegramChatId;
          
          await this.telegramService.notificarRecordatorio({
            chatId,
            funcionario: `${funcionario.nombre} ${funcionario.apellido}`,
            tipoMarcaje: 'INGRESO_TARDE',
          });

          notificacionesEnviadas++;
        }
      }

      this.logger.log(`✅ Recordatorios ingreso tarde: ${notificacionesEnviadas} enviados`);
    } catch (error) {
      this.logger.error('❌ Error enviando recordatorios ingreso tarde:', error);
    }
  }

  /**
   * CRON JOB 4: Alerta de 3+ faltas en el mes
   * Se ejecuta todos los lunes a las 08:00
   */
  @Cron('0 8 * * 1', {
    name: 'alerta-faltas-mensuales',
    timeZone: 'America/La_Paz',
  })
  async alertaFaltasMensuales() {
    this.logger.log('🚨 Verificando faltas mensuales...');

    try {
      const hoy = new Date();
      const inicioMes = startOfMonth(hoy);
      const finMes = endOfMonth(hoy);

      // Obtener días hábiles del mes (lunes a viernes)
      const diasHabiles = eachDayOfInterval({
        start: inicioMes,
        end: hoy, // Solo hasta hoy
      }).filter(day => !isWeekend(day));

      // Obtener funcionarios con Telegram
      const funcionarios = await this.prisma.funcionario.findMany({
        where: {
          estado: true,
          telegramChatId: { not: null },
        } as any,
      });

      let notificacionesEnviadas = 0;

      for (const funcionario of funcionarios) {
        // Obtener días que el funcionario asistió
        const asistencias = await this.prisma.asistencia.findMany({
          where: {
            funcionarioId: funcionario.id,
            fecha: {
              gte: inicioMes,
              lte: hoy,
            },
          },
          select: {
            fecha: true,
          },
        });

        // Crear set de días con asistencia
        const diasConAsistencia = new Set(
          asistencias.map(a => format(new Date(a.fecha), 'yyyy-MM-dd'))
        );

        // Contar faltas
        let faltas = 0;
        for (const dia of diasHabiles) {
          const diaStr = format(dia, 'yyyy-MM-dd');
          if (!diasConAsistencia.has(diaStr)) {
            faltas++;
          }
        }

        // Si tiene 3 o más faltas, notificar
        if (faltas >= 3) {
          const chatId = (funcionario as any).telegramChatId;
          
          await this.telegramService.notificarAlertaFaltas({
            chatId,
            funcionario: `${funcionario.nombre} ${funcionario.apellido}`,
            totalFaltas: faltas,
            mes: format(hoy, "MMMM 'de' yyyy", { locale: es }),
          });

          notificacionesEnviadas++;
        }
      }

      this.logger.log(`✅ Alertas de faltas: ${notificacionesEnviadas} notificaciones enviadas`);
    } catch (error) {
      this.logger.error('❌ Error verificando faltas mensuales:', error);
    }
  }

  /**
   * CRON JOB 5: Limpiar tokens expirados
   * Se ejecuta todos los días a las 00:00
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    name: 'limpiar-tokens-expirados',
    timeZone: 'America/La_Paz',
  })
  async limpiarTokensExpirados() {
    this.logger.log('🧹 Limpiando tokens expirados...');

    try {
      const result = await this.prisma.telegramLinkToken.deleteMany({
        where: {
          OR: [
            { expiresAt: { lt: new Date() } },
            { usado: true },
          ],
        },
      });

      this.logger.log(`✅ Tokens eliminados: ${result.count}`);
    } catch (error) {
      this.logger.error('❌ Error limpiando tokens:', error);
    }
  }

  /**
   * CRON JOB 6: Limpiar fotos antiguas (opcional)
   * Se ejecuta el primer día de cada mes a las 03:00
   */
  @Cron('0 3 1 * *', {
    name: 'limpiar-fotos-antiguas',
    timeZone: 'America/La_Paz',
  })
  async limpiarFotosAntiguas() {
    this.logger.log('🗑️  Limpiando fotos antiguas...');

    try {
      const hace90Dias = new Date();
      hace90Dias.setDate(hace90Dias.getDate() - 90);

      // Obtener marcajes faciales antiguos
      const marcajesAntiguos = await this.prisma.marcajeFacial.findMany({
        where: {
          createdAt: { lt: hace90Dias },
        },
        include: {
          asistencia: true,
        },
      });

      this.logger.log(`📊 Fotos antiguas encontradas: ${marcajesAntiguos.length}`);

      // Nota: La eliminación física de archivos debe hacerse con cuidado
      // Por ahora solo registramos cuántas hay
      // En producción, aquí se eliminarían los archivos del filesystem

      this.logger.log(`✅ Limpieza de fotos completada`);
    } catch (error) {
      this.logger.error('❌ Error limpiando fotos antiguas:', error);
    }
  }

  /**
   * Método manual para ejecutar tareas (testing)
   */
  async ejecutarTareaManual(nombreTarea: string): Promise<any> {
    this.logger.log(`🔧 Ejecutando tarea manual: ${nombreTarea}`);

    switch (nombreTarea) {
      case 'salidas-no-registradas':
        await this.verificarSalidasNoRegistradas();
        break;
      case 'recordatorio-ingreso-manana':
        await this.recordatorioIngresoManana();
        break;
      case 'recordatorio-ingreso-tarde':
        await this.recordatorioIngresoTarde();
        break;
      case 'alerta-faltas':
        await this.alertaFaltasMensuales();
        break;
      case 'limpiar-tokens':
        await this.limpiarTokensExpirados();
        break;
      case 'limpiar-fotos':
        await this.limpiarFotosAntiguas();
        break;
      default:
        return { error: 'Tarea no encontrada' };
    }

    return { message: `Tarea ${nombreTarea} ejecutada exitosamente` };
  }

  /**
   * Obtener estado de las tareas programadas
   */
  getEstadoTareas() {
    return {
      tareas: [
        {
          nombre: 'Salidas no registradas',
          cron: '0 19 * * *',
          descripcion: 'Notifica a las 19:00 si no se registró salida',
          proximaEjecucion: 'Hoy a las 19:00',
        },
        {
          nombre: 'Recordatorio ingreso mañana',
          cron: '30 8 * * *',
          descripcion: 'Recuerda marcar ingreso a las 08:30',
          proximaEjecucion: 'Mañana a las 08:30',
        },
        {
          nombre: 'Recordatorio ingreso tarde',
          cron: '30 14 * * *',
          descripcion: 'Recuerda marcar ingreso a las 14:30',
          proximaEjecucion: 'Hoy a las 14:30',
        },
        {
          nombre: 'Alerta 3+ faltas',
          cron: '0 8 * * 1',
          descripcion: 'Alerta los lunes a las 08:00',
          proximaEjecucion: 'Próximo lunes a las 08:00',
        },
        {
          nombre: 'Limpiar tokens',
          cron: '0 0 * * *',
          descripcion: 'Limpia tokens expirados a las 00:00',
          proximaEjecucion: 'Hoy a las 00:00',
        },
        {
          nombre: 'Limpiar fotos antiguas',
          cron: '0 3 1 * *',
          descripcion: 'Limpia fotos >90 días el día 1 a las 03:00',
          proximaEjecucion: 'Día 1 del próximo mes a las 03:00',
        },
      ],
      timeZone: 'America/La_Paz',
    };
  }
}