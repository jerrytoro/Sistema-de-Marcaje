import { PrismaService } from '../prisma/prisma.service';
import '@tensorflow/tfjs-backend-cpu';
export declare class FacialRecognitionService {
    private prisma;
    private modelsLoaded;
    constructor(prisma: PrismaService);
    private inicializar;
    private cargarModelos;
    private detectarRostro;
    registrarDatosFaciales(funcionarioId: number, foto: Express.Multer.File): Promise<{
        message: string;
        funcionarioId: number;
        registros: number;
    }>;
    registrarMultiple(funcionarioId: number, fotos: Express.Multer.File[], metadata: Record<string, any>): Promise<{
        message: string;
        funcionarioId: number;
        registrosCreados: number;
        detalles: {
            id: any;
            instruccion: any;
        }[];
    }>;
    verificarYMarcar(foto: Express.Multer.File): Promise<{
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
            tipo: string;
            hora: Date;
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
