"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const telegram_service_1 = require("./telegram.service");
const QRCode = __importStar(require("qrcode"));
const crypto = __importStar(require("crypto"));
let NotificationsService = class NotificationsService {
    prisma;
    telegramService;
    constructor(prisma, telegramService) {
        this.prisma = prisma;
        this.telegramService = telegramService;
    }
    async generarQRTelegram(funcionarioId) {
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);
        await this.prisma.telegramLinkToken.create({
            data: {
                token,
                funcionarioId,
                expiresAt,
                usado: false,
            },
        });
        const botUsername = this.telegramService.getBotUsername();
        const deepLink = `https://t.me/${botUsername}?start=${token}`;
        const qrDataUrl = await QRCode.toDataURL(deepLink, {
            errorCorrectionLevel: 'M',
            type: 'image/png',
            width: 300,
            margin: 2,
        });
        return qrDataUrl;
    }
    async verificarVinculacionTelegram(funcionarioId) {
        const funcionario = await this.prisma.funcionario.findUnique({
            where: { id: funcionarioId },
        });
        if (!funcionario) {
            return {
                vinculado: false,
                chatId: null,
            };
        }
        return {
            vinculado: !!funcionario.telegramChatId,
            chatId: funcionario.telegramChatId || null,
        };
    }
    async desvincularTelegram(funcionarioId) {
        await this.prisma.funcionario.update({
            where: { id: funcionarioId },
            data: { telegramChatId: null },
        });
    }
    async notificarMarcaje(asistenciaId) {
        const asistencia = await this.prisma.asistencia.findUnique({
            where: { id: asistenciaId },
            include: {
                funcionario: true,
            },
        });
        if (!asistencia || !asistencia.funcionario) {
            return;
        }
        const chatId = asistencia.funcionario.telegramChatId;
        if (!chatId) {
            console.log(`Funcionario ${asistencia.funcionario.id} no tiene Telegram vinculado`);
            return;
        }
        const hora = new Date(asistencia.horaMarcaje).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
        });
        await this.telegramService.notificarMarcajeExitoso({
            chatId,
            funcionario: `${asistencia.funcionario.nombre} ${asistencia.funcionario.apellido}`,
            tipoMarcaje: asistencia.tipoMarcaje,
            hora,
            minutosTardanza: asistencia.minutosTardanza,
        });
    }
    async procesarWebhook(event, data) {
        console.log(`Webhook recibido: ${event}`, data);
        switch (event) {
            case 'marcaje_exitoso':
                if (data.asistenciaId) {
                    await this.notificarMarcaje(data.asistenciaId);
                }
                break;
            case 'salida_no_registrada':
                break;
            case 'recordatorio_marcaje':
                break;
            case 'alerta_faltas':
                break;
            default:
                console.warn(`Evento desconocido: ${event}`);
        }
        return { success: true, event, processed: true };
    }
    async limpiarTokensExpirados() {
        const result = await this.prisma.telegramLinkToken.deleteMany({
            where: {
                OR: [
                    { expiresAt: { lt: new Date() } },
                    { usado: true },
                ],
            },
        });
        return result.count;
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        telegram_service_1.TelegramService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map