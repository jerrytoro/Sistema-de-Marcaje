import { PrismaService } from '../prisma/prisma.service';
import { TelegramService } from '../notifications/telegram.service';
export declare class FacialRecognitionService {
    private prisma;
    private telegramService;
    constructor(prisma: PrismaService, telegramService: TelegramService);
    registrarDescriptores(funcionarioId: number, descriptores: {
        descriptor: number[];
        instruccion: string;
    }[]): Promise<{
        success: boolean;
        message: string;
        funcionarioId: number;
        registrosCreados: number;
        detalles: {
            id: any;
            instruccion: string;
        }[];
    }>;
    verificarDescriptor(descriptor: number[]): Promise<{
        success: boolean;
        message: string;
        distancia?: undefined;
        umbral?: undefined;
        asistencia?: undefined;
        funcionario?: undefined;
        confianza?: undefined;
    } | {
        success: boolean;
        message: string;
        distancia: number;
        umbral: number;
        asistencia?: undefined;
        funcionario?: undefined;
        confianza?: undefined;
    } | {
        success: boolean;
        message: string;
        asistencia: {
            id: number;
            fecha: Date;
            tipoMarcaje: import(".prisma/client").$Enums.TipoMarcaje;
            minutosTardanza: number;
        };
        funcionario: {
            id: any;
            nombre: any;
            apellido: any;
            cargo: any;
        };
        confianza: number;
        distancia: number;
        umbral: number;
    }>;
    private calcularDistanciaEuclidiana;
    private determinarTipoMarcaje;
    private calcularAtraso;
    obtenerEstado(funcionarioId: number): Promise<{
        funcionarioId: number;
        registrado: boolean;
        cantidadRegistros: number;
        ultimoRegistro: Date;
        registros: {
            id: any;
            metadata: any;
            fecha: any;
        }[];
    }>;
    eliminarRegistros(funcionarioId: number): Promise<{
        message: string;
        eliminados: number;
    }>;
}
