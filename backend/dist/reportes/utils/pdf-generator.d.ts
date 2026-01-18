import type { Response } from 'express';
interface DatosReporte {
    funcionario: {
        nombre: string;
        apellido: string;
        cargo: string;
        dependencia: string;
    };
    periodo: {
        fechaInicio: string;
        fechaFin: string;
        mes: string;
        anio: number;
    };
    resumen: {
        diasTrabajados: number;
        tiempoTrabajado: string;
        tardanzaTotal: string;
        salidaAnticipadaTotal: string;
    };
    asistenciasPorDia: Array<{
        fecha: string;
        ingresoManana: string | null;
        salidaDescanso: string | null;
        ingresoTarde: string | null;
        salidaFinal: string | null;
        tardanza: string;
        salidaAnticipada: string;
        permisos: string;
        jornada: string;
        cantidadMarcajes: number;
    }>;
}
export declare class PDFGenerator {
    static generarReporteMensual(datosReporte: DatosReporte, res: Response): Promise<void>;
    static generarPDFDesdeReporte(funcionario: any, periodo: {
        mes: string;
        anio: number;
        fechaInicio: string;
        fechaFin: string;
    }, resumen: any, diasTrabajados: any[], res: Response): Promise<void>;
    static procesarMarcajesConLogicaCorrecta(marcajes: any[], horarios: any): {
        diasTrabajados: any[];
        totalTardanza: number;
        totalSalidaAnticipada: number;
        totalJornada: number;
        diasUnicos: number;
    };
    private static generarContenido;
    private static dibujarTabla;
    private static convertirHoraAMinutos;
    private static formatearFechaCorta;
    private static formatearTiempo;
    static obtenerNombreMes(mes: number): string;
}
export {};
