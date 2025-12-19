import { FacialRecognitionService } from './facial-recognition.service';
export declare class FacialRecognitionController {
    private readonly facialService;
    constructor(facialService: FacialRecognitionService);
    registrarDatosFaciales(funcionarioId: number, file: Express.Multer.File): Promise<any>;
    verificarRostro(file: Express.Multer.File): Promise<any>;
    registrarMarcajeFacial(file: Express.Multer.File, tipoMarcaje?: string): Promise<any>;
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
    eliminarDatosFaciales(funcionarioId: number): Promise<{
        message: string;
    }>;
}
