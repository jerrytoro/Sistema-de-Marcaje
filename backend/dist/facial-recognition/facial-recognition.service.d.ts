import { PrismaService } from '../database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
export declare class FacialRecognitionService {
    private prisma;
    private notificationsService;
    private modelsLoaded;
    private readonly modelsPath;
    constructor(prisma: PrismaService, notificationsService: NotificationsService);
    private loadModels;
    registrarDatosFaciales(funcionarioId: number, imagePath: string): Promise<any>;
    verificarRostro(imagePath: string): Promise<any>;
    registrarMarcajeFacial(imagePath: string, tipoMarcaje?: string): Promise<any>;
    private determinarTipoMarcaje;
    obtenerDatosFaciales(funcionarioId: number): Promise<{
        id: number;
        funcionarioId: number;
        fotoReferencia: string;
        activo: boolean;
        confianza: number;
        createdAt: Date;
        updatedAt: Date;
        funcionario: {
            nombre: string;
            apellido: string;
            cargo: string;
        };
    }>;
    eliminarDatosFaciales(funcionarioId: number): Promise<{
        message: string;
    }>;
    listarFuncionariosConDatosFaciales(): Promise<{
        id: number;
        funcionarioId: number;
        funcionario: {
            nombre: string;
            apellido: string;
            cargo: string;
            dependencia: string;
        };
        fotoReferencia: string;
        confianza: number;
        createdAt: Date;
    }[]>;
}
