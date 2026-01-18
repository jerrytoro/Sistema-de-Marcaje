import type { Response } from 'express';
import { ReportesService } from './reportes.service';
import { GenerarReporteDto } from './dto/generar-reporte.dto';
export declare class ReportesController {
    private readonly reportesService;
    constructor(reportesService: ReportesService);
    generarReporte(generarReporteDto: GenerarReporteDto): Promise<{
        fechaGeneracion: string;
        funcionario: {
            nombre: string;
            apellido: string;
            cargo: string;
            dependencia: string;
            id: number;
        };
        id: number;
        funcionarioId: number;
        mes: number;
        anio: number;
        totalDiasTrabajados: number;
        totalMinutosTardanza: number;
        totalMinutosSalidaAnticipada: number;
        totalMinutosTrabajados: number;
        totalAusencias: number;
        totalPermisos: number;
        reporteGenerado: boolean;
        urlReportePdf: string | null;
    }>;
    findAll(): Promise<{
        fechaGeneracion: string;
        funcionario: {
            nombre: string;
            apellido: string;
            cargo: string;
            dependencia: string;
            id: number;
        };
        id: number;
        funcionarioId: number;
        mes: number;
        anio: number;
        totalDiasTrabajados: number;
        totalMinutosTardanza: number;
        totalMinutosSalidaAnticipada: number;
        totalMinutosTrabajados: number;
        totalAusencias: number;
        totalPermisos: number;
        reporteGenerado: boolean;
        urlReportePdf: string | null;
    }[]>;
    findByFuncionario(id: number): Promise<{
        fechaGeneracion: string;
        funcionario: {
            nombre: string;
            apellido: string;
            cargo: string;
            dependencia: string;
            id: number;
        };
        id: number;
        funcionarioId: number;
        mes: number;
        anio: number;
        totalDiasTrabajados: number;
        totalMinutosTardanza: number;
        totalMinutosSalidaAnticipada: number;
        totalMinutosTrabajados: number;
        totalAusencias: number;
        totalPermisos: number;
        reporteGenerado: boolean;
        urlReportePdf: string | null;
    }[]>;
    findOne(id: number): Promise<{
        fechaGeneracion: string;
        funcionario: {
            nombre: string;
            apellido: string;
            cargo: string;
            dependencia: string;
            id: number;
        };
        id: number;
        funcionarioId: number;
        mes: number;
        anio: number;
        totalDiasTrabajados: number;
        totalMinutosTardanza: number;
        totalMinutosSalidaAnticipada: number;
        totalMinutosTrabajados: number;
        totalAusencias: number;
        totalPermisos: number;
        reporteGenerado: boolean;
        urlReportePdf: string | null;
    }>;
    descargarPDF(id: number, res: Response): Promise<void>;
    regenerarReporte(id: number): Promise<{
        fechaGeneracion: string;
        funcionario: {
            nombre: string;
            apellido: string;
            cargo: string;
            dependencia: string;
            id: number;
        };
        id: number;
        funcionarioId: number;
        mes: number;
        anio: number;
        totalDiasTrabajados: number;
        totalMinutosTardanza: number;
        totalMinutosSalidaAnticipada: number;
        totalMinutosTrabajados: number;
        totalAusencias: number;
        totalPermisos: number;
        reporteGenerado: boolean;
        urlReportePdf: string | null;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
