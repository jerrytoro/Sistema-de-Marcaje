import type { Response } from 'express';
import { ReportesService } from './reportes.service';
import { GenerarReporteDto } from './dto/generar-reporte.dto';
export declare class ReportesController {
    private readonly reportesService;
    constructor(reportesService: ReportesService);
    generarReporte(generarReporteDto: GenerarReporteDto): Promise<{
        fechaGeneracion: string;
        funcionario: {
            id: number;
            nombre: string;
            apellido: string;
            cargo: string;
            dependencia: string;
        };
        anio: number;
        mes: number;
        totalDiasTrabajados: number;
        totalMinutosTardanza: number;
        totalMinutosSalidaAnticipada: number;
        totalMinutosTrabajados: number;
        totalAusencias: number;
        totalPermisos: number;
        reporteGenerado: boolean;
        urlReportePdf: string | null;
        id: number;
        funcionarioId: number;
    }>;
    findAll(): Promise<{
        fechaGeneracion: string;
        funcionario: {
            id: number;
            nombre: string;
            apellido: string;
            cargo: string;
            dependencia: string;
        };
        anio: number;
        mes: number;
        totalDiasTrabajados: number;
        totalMinutosTardanza: number;
        totalMinutosSalidaAnticipada: number;
        totalMinutosTrabajados: number;
        totalAusencias: number;
        totalPermisos: number;
        reporteGenerado: boolean;
        urlReportePdf: string | null;
        id: number;
        funcionarioId: number;
    }[]>;
    findByFuncionario(id: number): Promise<{
        fechaGeneracion: string;
        funcionario: {
            id: number;
            nombre: string;
            apellido: string;
            cargo: string;
            dependencia: string;
        };
        anio: number;
        mes: number;
        totalDiasTrabajados: number;
        totalMinutosTardanza: number;
        totalMinutosSalidaAnticipada: number;
        totalMinutosTrabajados: number;
        totalAusencias: number;
        totalPermisos: number;
        reporteGenerado: boolean;
        urlReportePdf: string | null;
        id: number;
        funcionarioId: number;
    }[]>;
    findOne(id: number): Promise<{
        fechaGeneracion: string;
        funcionario: {
            id: number;
            nombre: string;
            apellido: string;
            cargo: string;
            dependencia: string;
        };
        anio: number;
        mes: number;
        totalDiasTrabajados: number;
        totalMinutosTardanza: number;
        totalMinutosSalidaAnticipada: number;
        totalMinutosTrabajados: number;
        totalAusencias: number;
        totalPermisos: number;
        reporteGenerado: boolean;
        urlReportePdf: string | null;
        id: number;
        funcionarioId: number;
    }>;
    descargarPDF(id: number, res: Response): Promise<void>;
    regenerarReporte(id: number): Promise<{
        fechaGeneracion: string;
        funcionario: {
            id: number;
            nombre: string;
            apellido: string;
            cargo: string;
            dependencia: string;
        };
        anio: number;
        mes: number;
        totalDiasTrabajados: number;
        totalMinutosTardanza: number;
        totalMinutosSalidaAnticipada: number;
        totalMinutosTrabajados: number;
        totalAusencias: number;
        totalPermisos: number;
        reporteGenerado: boolean;
        urlReportePdf: string | null;
        id: number;
        funcionarioId: number;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
