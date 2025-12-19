import { PrismaService } from '../database/prisma.service';
import { GenerarReporteDto } from './dto/generar-reporte.dto';
import type { Response } from 'express';
export declare class ReportesService {
    private prisma;
    constructor(prisma: PrismaService);
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
    findByFuncionario(funcionarioId: number): Promise<({
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
