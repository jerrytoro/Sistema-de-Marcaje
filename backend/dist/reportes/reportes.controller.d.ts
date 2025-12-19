import type { Response } from 'express';
import { ReportesService } from './reportes.service';
import { GenerarReporteDto } from './dto/generar-reporte.dto';
export declare class ReportesController {
    private readonly reportesService;
    constructor(reportesService: ReportesService);
    generarReporte(generarReporteDto: GenerarReporteDto): Promise<{
        funcionario: {
            nombre: string;
            apellido: string;
            cargo: string;
            dependencia: string;
            id: number;
        };
    } & {
        id: number;
        funcionarioId: number;
        mes: number;
        anio: number;
        totalDiasTrabajados: number;
        totalMinutosTardanza: number;
        totalMinutosTrabajados: number;
        totalAusencias: number;
        totalPermisos: number;
        reporteGenerado: boolean;
        urlReportePdf: string | null;
        fechaGeneracion: Date;
    }>;
    findAll(): Promise<({
        funcionario: {
            nombre: string;
            apellido: string;
            cargo: string;
            dependencia: string;
            id: number;
        };
    } & {
        id: number;
        funcionarioId: number;
        mes: number;
        anio: number;
        totalDiasTrabajados: number;
        totalMinutosTardanza: number;
        totalMinutosTrabajados: number;
        totalAusencias: number;
        totalPermisos: number;
        reporteGenerado: boolean;
        urlReportePdf: string | null;
        fechaGeneracion: Date;
    })[]>;
    findByFuncionario(id: number): Promise<({
        funcionario: {
            nombre: string;
            apellido: string;
            cargo: string;
            dependencia: string;
            id: number;
        };
    } & {
        id: number;
        funcionarioId: number;
        mes: number;
        anio: number;
        totalDiasTrabajados: number;
        totalMinutosTardanza: number;
        totalMinutosTrabajados: number;
        totalAusencias: number;
        totalPermisos: number;
        reporteGenerado: boolean;
        urlReportePdf: string | null;
        fechaGeneracion: Date;
    })[]>;
    findOne(id: number): Promise<{
        funcionario: {
            nombre: string;
            apellido: string;
            cargo: string;
            dependencia: string;
            id: number;
        };
    } & {
        id: number;
        funcionarioId: number;
        mes: number;
        anio: number;
        totalDiasTrabajados: number;
        totalMinutosTardanza: number;
        totalMinutosTrabajados: number;
        totalAusencias: number;
        totalPermisos: number;
        reporteGenerado: boolean;
        urlReportePdf: string | null;
        fechaGeneracion: Date;
    }>;
    descargarPDF(id: number, res: Response): Promise<void>;
    regenerarReporte(id: number): Promise<{
        funcionario: {
            nombre: string;
            apellido: string;
            cargo: string;
            dependencia: string;
            id: number;
        };
    } & {
        id: number;
        funcionarioId: number;
        mes: number;
        anio: number;
        totalDiasTrabajados: number;
        totalMinutosTardanza: number;
        totalMinutosTrabajados: number;
        totalAusencias: number;
        totalPermisos: number;
        reporteGenerado: boolean;
        urlReportePdf: string | null;
        fechaGeneracion: Date;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
