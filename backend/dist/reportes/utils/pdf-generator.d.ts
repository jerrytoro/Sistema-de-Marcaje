import type { Response } from 'express';
interface DatosReporte {
    funcionario: {
        nombre: string;
        apellido: string;
        cargo: string;
        dependencia: string;
    };
    periodo: {
        mes: string;
        anio: number;
    };
    resumen: {
        totalDiasTrabajados: number;
        totalMinutosTardanza: number;
        totalMinutosTrabajados: number;
        totalAusencias: number;
        totalPermisos: number;
    };
    marcajes: Array<{
        fecha: string;
        tipoMarcaje: string;
        horaMarcaje: string;
        minutosTardanza: number;
    }>;
}
export declare class PDFGenerator {
    static generarReporteMensual(datos: DatosReporte, res: Response): Promise<void>;
    private static formatTipoMarcaje;
    static obtenerNombreMes(mes: number): string;
}
export {};
