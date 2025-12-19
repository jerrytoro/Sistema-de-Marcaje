import { NotificationsService } from './notifications.service';
import { TelegramService } from './telegram.service';
export declare class NotificationsController {
    private readonly notificationsService;
    private readonly telegramService;
    constructor(notificationsService: NotificationsService, telegramService: TelegramService);
    generarQRTelegram(funcionarioId: number): Promise<{
        qrDataUrl: string;
        botUsername: string;
        expiresIn: string;
    }>;
    verificarEstadoTelegram(funcionarioId: number): Promise<any>;
    desvincularTelegram(funcionarioId: number): Promise<{
        message: string;
    }>;
    procesarWebhook(body: any): Promise<any>;
    enviarNotificacionPrueba(funcionarioId: number): Promise<{
        error: string;
        message?: undefined;
        chatId?: undefined;
    } | {
        message: string;
        chatId: any;
        error?: undefined;
    }>;
    verificarEstadoBot(): Promise<{
        active: boolean;
        username: string;
    }>;
}
