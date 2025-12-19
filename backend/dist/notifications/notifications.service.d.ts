import { PrismaService } from '../database/prisma.service';
import { TelegramService } from './telegram.service';
export declare class NotificationsService {
    private prisma;
    private telegramService;
    constructor(prisma: PrismaService, telegramService: TelegramService);
    generarQRTelegram(funcionarioId: number): Promise<string>;
    verificarVinculacionTelegram(funcionarioId: number): Promise<any>;
    desvincularTelegram(funcionarioId: number): Promise<void>;
    notificarMarcaje(asistenciaId: number): Promise<void>;
    procesarWebhook(event: string, data: any): Promise<any>;
    limpiarTokensExpirados(): Promise<number>;
}
