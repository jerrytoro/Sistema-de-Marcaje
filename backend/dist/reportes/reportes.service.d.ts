import { PrismaService } from '../database/prisma.service';
import { GenerarReporteDto } from './dto/generar-reporte.dto';
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
    findByFuncionario(funcionarioId: number): Promise<{
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
    private obtenerNombreMes;
}
