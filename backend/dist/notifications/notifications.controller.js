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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const notifications_service_1 = require("./notifications.service");
const telegram_service_1 = require("./telegram.service");
let NotificationsController = class NotificationsController {
    notificationsService;
    telegramService;
    constructor(notificationsService, telegramService) {
        this.notificationsService = notificationsService;
        this.telegramService = telegramService;
    }
    async generarQRTelegram(funcionarioId) {
        const qrDataUrl = await this.notificationsService.generarQRTelegram(funcionarioId);
        return {
            qrDataUrl,
            botUsername: this.telegramService.getBotUsername(),
            expiresIn: '24 horas',
        };
    }
    async verificarEstadoTelegram(funcionarioId) {
        return this.notificationsService.verificarVinculacionTelegram(funcionarioId);
    }
    async desvincularTelegram(funcionarioId) {
        await this.notificationsService.desvincularTelegram(funcionarioId);
        return {
            message: 'Cuenta de Telegram desvinculada exitosamente',
        };
    }
    async procesarWebhook(body) {
        const { event, data } = body;
        return this.notificationsService.procesarWebhook(event, data);
    }
    async enviarNotificacionPrueba(funcionarioId) {
        const funcionario = await this.notificationsService['prisma'].funcionario.findUnique({
            where: { id: funcionarioId },
        });
        if (!funcionario) {
            return { error: 'Funcionario no encontrado' };
        }
        const chatId = funcionario.telegramChatId;
        if (!chatId) {
            return { error: 'Funcionario no tiene Telegram vinculado' };
        }
        await this.telegramService.notificarMarcajeExitoso({
            chatId,
            funcionario: `${funcionario.nombre} ${funcionario.apellido}`,
            tipoMarcaje: 'INGRESO_MANANA',
            hora: new Date().toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit',
            }),
            minutosTardanza: 0,
        });
        return {
            message: 'Notificación de prueba enviada',
            chatId,
        };
    }
    async verificarEstadoBot() {
        return {
            active: this.telegramService.isBotActive(),
            username: this.telegramService.getBotUsername(),
        };
    }
};
exports.NotificationsController = NotificationsController;
__decorate([
    (0, common_1.Get)('telegram/qr/:funcionarioId'),
    __param(0, (0, common_1.Param)('funcionarioId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "generarQRTelegram", null);
__decorate([
    (0, common_1.Get)('telegram/status/:funcionarioId'),
    __param(0, (0, common_1.Param)('funcionarioId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "verificarEstadoTelegram", null);
__decorate([
    (0, common_1.Delete)('telegram/:funcionarioId'),
    __param(0, (0, common_1.Param)('funcionarioId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "desvincularTelegram", null);
__decorate([
    (0, common_1.Post)('webhook'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "procesarWebhook", null);
__decorate([
    (0, common_1.Post)('test/:funcionarioId'),
    __param(0, (0, common_1.Param)('funcionarioId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "enviarNotificacionPrueba", null);
__decorate([
    (0, common_1.Get)('bot-status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "verificarEstadoBot", null);
exports.NotificationsController = NotificationsController = __decorate([
    (0, common_1.Controller)('notifications'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [notifications_service_1.NotificationsService,
        telegram_service_1.TelegramService])
], NotificationsController);
//# sourceMappingURL=notifications.controller.js.map