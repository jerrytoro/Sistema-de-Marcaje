import { FacialRecognitionService } from './facial-recognition.service';
export declare class FacialRecognitionController {
    private readonly facialRecognitionService;
    constructor(facialRecognitionService: FacialRecognitionService);
    registrar(funcionarioId: number, foto: Express.Multer.File): Promise<{
        message: string;
        funcionarioId: number;
        registros: number;
    }>;
    registrarMultiple(funcionarioId: number, fotos: Express.Multer.File[], body: any): Promise<{
        message: string;
        funcionarioId: number;
        registrosCreados: number;
        detalles: {
            id: any;
            instruccion: any;
        }[];
    }>;
    marcar(foto: Express.Multer.File): Promise<{
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
