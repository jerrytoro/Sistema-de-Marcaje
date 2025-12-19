import { PrismaService } from '../database/prisma.service';
import { TelegramService } from '../notifications/telegram.service';
export declare class ScheduledTasksService {
    private prisma;
    private telegramService;
    private readonly logger;
    constructor(prisma: PrismaService, telegramService: TelegramService);
    verificarSalidasNoRegistradas(): Promise<void>;
    recordatorioIngresoManana(): Promise<void>;
    recordatorioIngresoTarde(): Promise<void>;
    alertaFaltasMensuales(): Promise<void>;
    limpiarTokensExpirados(): Promise<void>;
    limpiarFotosAntiguas(): Promise<void>;
    ejecutarTareaManual(nombreTarea: string): Promise<any>;
    getEstadoTareas(): {
        tareas: {
            nombre: string;
            cron: string;
            descripcion: string;
            proximaEjecucion: string;
        }[];
        timeZone: string;
    };
}
