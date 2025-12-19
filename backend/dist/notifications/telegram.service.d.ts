import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../database/prisma.service';
export declare class TelegramService implements OnModuleInit {
    private configService;
    private prisma;
    private bot;
    private botUsername;
    constructor(configService: ConfigService, prisma: PrismaService);
    onModuleInit(): void;
    private setupBotCommands;
    private vincularCuenta;
    private verificarEstadoVinculacion;
    private desvincularCuenta;
    notificarMarcajeExitoso(data: {
        chatId: string;
        funcionario: string;
        tipoMarcaje: string;
        hora: string;
        minutosTardanza: number;
    }): Promise<void>;
    notificarSalidaNoRegistrada(data: {
        chatId: string;
        funcionario: string;
        fecha: string;
    }): Promise<void>;
    notificarRecordatorio(data: {
        chatId: string;
        funcionario: string;
        tipoMarcaje: string;
    }): Promise<void>;
    notificarAlertaFaltas(data: {
        chatId: string;
        funcionario: string;
        totalFaltas: number;
        mes: string;
    }): Promise<void>;
    private getTipoMarcajeEmoji;
    private formatTipoMarcaje;
    isBotActive(): boolean;
    getBotUsername(): string;
}
