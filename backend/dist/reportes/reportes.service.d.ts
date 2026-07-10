import { PrismaService } from '../database/prisma.service';
import { GenerarReporteDto } from './dto/generar-reporte.dto';
import { GenerarReporteDependenciaDto } from './dto/generar-reporte-dependencia.dto';
import type { Response } from 'express';
export declare class ReportesService {
    private prisma;
    constructor(prisma: PrismaService);
    private agruparMarcajesPorDia;
    private formatearFecha;
    private obtenerRangoPeriodo;
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
    generarReportesPorDependencia(dto: GenerarReporteDependenciaDto): Promise<{
        success: boolean;
        mensaje: string;
        generados: number;
        omitidos: number;
        reportes: any[];
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
    findByFuncionario(funcionarioId: number): Promise<{
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
    private obtenerNombreMes;
}
