"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ScheduledTasksService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduledTasksService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../database/prisma.service");
const telegram_service_1 = require("../notifications/telegram.service");
const date_fns_1 = require("date-fns");
const locale_1 = require("date-fns/locale");
let ScheduledTasksService = ScheduledTasksService_1 = class ScheduledTasksService {
    prisma;
    telegramService;
    logger = new common_1.Logger(ScheduledTasksService_1.name);
    constructor(prisma, telegramService) {
        this.prisma = prisma;
        this.telegramService = telegramService;
    }
    async verificarSalidasNoRegistradas() {
        this.logger.log('🔍 Verificando salidas no registradas...');
        try {
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            const funcionarios = await this.prisma.funcionario.findMany({
                where: {
                    estado: true,
                    telegramChatId: { not: null },
                },
            });
            let notificacionesEnviadas = 0;
            for (const funcionario of funcionarios) {
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
                if (!salidaFinal) {
                    const chatId = funcionario.telegramChatId;
                    await this.telegramService.notificarSalidaNoRegistrada({
                        chatId,
                        funcionario: `${funcionario.nombre} ${funcionario.apellido}`,
                        fecha: (0, date_fns_1.format)(hoy, "dd 'de' MMMM 'de' yyyy", { locale: locale_1.es }),
                    });
                    notificacionesEnviadas++;
                }
            }
            this.logger.log(`✅ Salidas no registradas: ${notificacionesEnviadas} notificaciones enviadas`);
        }
        catch (error) {
            this.logger.error('❌ Error verificando salidas no registradas:', error);
        }
    }
    async recordatorioIngresoManana() {
        this.logger.log('⏰ Enviando recordatorios de ingreso mañana...');
        try {
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            const funcionarios = await this.prisma.funcionario.findMany({
                where: {
                    estado: true,
                    telegramChatId: { not: null },
                },
            });
            let notificacionesEnviadas = 0;
            for (const funcionario of funcionarios) {
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
                    const chatId = funcionario.telegramChatId;
                    await this.telegramService.notificarRecordatorio({
                        chatId,
                        funcionario: `${funcionario.nombre} ${funcionario.apellido}`,
                        tipoMarcaje: 'INGRESO_MANANA',
                    });
                    notificacionesEnviadas++;
                }
            }
            this.logger.log(`✅ Recordatorios ingreso mañana: ${notificacionesEnviadas} enviados`);
        }
        catch (error) {
            this.logger.error('❌ Error enviando recordatorios ingreso mañana:', error);
        }
    }
    async recordatorioIngresoTarde() {
        this.logger.log('⏰ Enviando recordatorios de ingreso tarde...');
        try {
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            const funcionarios = await this.prisma.funcionario.findMany({
                where: {
                    estado: true,
                    telegramChatId: { not: null },
                },
            });
            let notificacionesEnviadas = 0;
            for (const funcionario of funcionarios) {
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
                    const chatId = funcionario.telegramChatId;
                    await this.telegramService.notificarRecordatorio({
                        chatId,
                        funcionario: `${funcionario.nombre} ${funcionario.apellido}`,
                        tipoMarcaje: 'INGRESO_TARDE',
                    });
                    notificacionesEnviadas++;
                }
            }
            this.logger.log(`✅ Recordatorios ingreso tarde: ${notificacionesEnviadas} enviados`);
        }
        catch (error) {
            this.logger.error('❌ Error enviando recordatorios ingreso tarde:', error);
        }
    }
    async alertaFaltasMensuales() {
        this.logger.log('🚨 Verificando faltas mensuales...');
        try {
            const hoy = new Date();
            const inicioMes = (0, date_fns_1.startOfMonth)(hoy);
            const finMes = (0, date_fns_1.endOfMonth)(hoy);
            const diasHabiles = (0, date_fns_1.eachDayOfInterval)({
                start: inicioMes,
                end: hoy,
            }).filter(day => !(0, date_fns_1.isWeekend)(day));
            const funcionarios = await this.prisma.funcionario.findMany({
                where: {
                    estado: true,
                    telegramChatId: { not: null },
                },
            });
            let notificacionesEnviadas = 0;
            for (const funcionario of funcionarios) {
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
                const diasConAsistencia = new Set(asistencias.map(a => (0, date_fns_1.format)(new Date(a.fecha), 'yyyy-MM-dd')));
                let faltas = 0;
                for (const dia of diasHabiles) {
                    const diaStr = (0, date_fns_1.format)(dia, 'yyyy-MM-dd');
                    if (!diasConAsistencia.has(diaStr)) {
                        faltas++;
                    }
                }
                if (faltas >= 3) {
                    const chatId = funcionario.telegramChatId;
                    await this.telegramService.notificarAlertaFaltas({
                        chatId,
                        funcionario: `${funcionario.nombre} ${funcionario.apellido}`,
                        totalFaltas: faltas,
                        mes: (0, date_fns_1.format)(hoy, "MMMM 'de' yyyy", { locale: locale_1.es }),
                    });
                    notificacionesEnviadas++;
                }
            }
            this.logger.log(`✅ Alertas de faltas: ${notificacionesEnviadas} notificaciones enviadas`);
        }
        catch (error) {
            this.logger.error('❌ Error verificando faltas mensuales:', error);
        }
    }
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
        }
        catch (error) {
            this.logger.error('❌ Error limpiando tokens:', error);
        }
    }
    async limpiarFotosAntiguas() {
        this.logger.log('🗑️  Limpiando fotos antiguas...');
        try {
            const hace90Dias = new Date();
            hace90Dias.setDate(hace90Dias.getDate() - 90);
            const marcajesAntiguos = await this.prisma.marcajeFacial.findMany({
                where: {
                    createdAt: { lt: hace90Dias },
                },
                include: {
                    asistencia: true,
                },
            });
            this.logger.log(`📊 Fotos antiguas encontradas: ${marcajesAntiguos.length}`);
            this.logger.log(`✅ Limpieza de fotos completada`);
        }
        catch (error) {
            this.logger.error('❌ Error limpiando fotos antiguas:', error);
        }
    }
    async ejecutarTareaManual(nombreTarea) {
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
};
exports.ScheduledTasksService = ScheduledTasksService;
__decorate([
    (0, schedule_1.Cron)('0 19 * * *', {
        name: 'verificar-salidas-no-registradas',
        timeZone: 'America/La_Paz',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ScheduledTasksService.prototype, "verificarSalidasNoRegistradas", null);
__decorate([
    (0, schedule_1.Cron)('30 8 * * *', {
        name: 'recordatorio-ingreso-manana',
        timeZone: 'America/La_Paz',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ScheduledTasksService.prototype, "recordatorioIngresoManana", null);
__decorate([
    (0, schedule_1.Cron)('30 14 * * *', {
        name: 'recordatorio-ingreso-tarde',
        timeZone: 'America/La_Paz',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ScheduledTasksService.prototype, "recordatorioIngresoTarde", null);
__decorate([
    (0, schedule_1.Cron)('0 8 * * 1', {
        name: 'alerta-faltas-mensuales',
        timeZone: 'America/La_Paz',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ScheduledTasksService.prototype, "alertaFaltasMensuales", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT, {
        name: 'limpiar-tokens-expirados',
        timeZone: 'America/La_Paz',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ScheduledTasksService.prototype, "limpiarTokensExpirados", null);
__decorate([
    (0, schedule_1.Cron)('0 3 1 * *', {
        name: 'limpiar-fotos-antiguas',
        timeZone: 'America/La_Paz',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ScheduledTasksService.prototype, "limpiarFotosAntiguas", null);
exports.ScheduledTasksService = ScheduledTasksService = ScheduledTasksService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        telegram_service_1.TelegramService])
], ScheduledTasksService);
//# sourceMappingURL=scheduled-tasks.service.js.map