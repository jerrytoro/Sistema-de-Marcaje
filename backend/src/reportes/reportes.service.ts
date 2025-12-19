import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { GenerarReporteDto } from './dto/generar-reporte.dto';
import { PDFGenerator } from './utils/pdf-generator';
import type { Response } from 'express';

/**
 * Servicio de Reportes
 */
@Injectable()
export class ReportesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Generar un nuevo reporte mensual
   */
  async generarReporte(generarReporteDto: GenerarReporteDto) {
    const { funcionarioId, anio, mes } = generarReporteDto;

    // Verificar que el funcionario existe
    const funcionario = await this.prisma.funcionario.findUnique({
      where: { id: funcionarioId },
    });

    if (!funcionario) {
      throw new NotFoundException(`Funcionario con ID ${funcionarioId} no encontrado`);
    }

    // Verificar si ya existe un reporte para este periodo
    const reporteExistente = await this.prisma.resumenMensual.findUnique({
      where: {
        unique_resumen_mensual: {
          funcionarioId,
          anio,
          mes,
        },
      },
    });

    if (reporteExistente) {
      throw new BadRequestException(
        `Ya existe un reporte para ${funcionario.nombre} ${funcionario.apellido} del mes ${mes}/${anio}`,
      );
    }

    // Obtener marcajes del mes
    const fechaInicio = new Date(anio, mes - 1, 1);
    const fechaFin = new Date(anio, mes, 0);

    const marcajes = await this.prisma.asistencia.findMany({
      where: {
        funcionarioId,
        fecha: {
          gte: fechaInicio,
          lte: fechaFin,
        },
      },
      orderBy: {
        fecha: 'asc',
      },
    });

    // Calcular estadísticas
    const diasUnicos = new Set(marcajes.map(m => m.fecha.toISOString().split('T')[0])).size;
    const totalMinutosTardanza = marcajes.reduce((sum, m) => sum + m.minutosTardanza, 0);

    // Calcular minutos trabajados (simplificado)
    const totalMinutosTrabajados = diasUnicos * 480; // 8 horas = 480 minutos por día

    // Crear el reporte
    const reporte = await this.prisma.resumenMensual.create({
      data: {
        funcionarioId,
        anio,
        mes,
        totalDiasTrabajados: diasUnicos,
        totalMinutosTardanza,
        totalMinutosTrabajados,
        totalAusencias: 0, // Por implementar
        totalPermisos: 0, // Por implementar
        reporteGenerado: true,
        urlReportePdf: null, // Se guardará cuando se descargue
      },
      include: {
        funcionario: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            cargo: true,
            dependencia: true,
          },
        },
      },
    });

    return reporte;
  }

  /**
   * Listar todos los reportes
   */
  async findAll() {
    const reportes = await this.prisma.resumenMensual.findMany({
      include: {
        funcionario: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            cargo: true,
            dependencia: true,
          },
        },
      },
      orderBy: [
        { anio: 'desc' },
        { mes: 'desc' },
      ],
    });

    return reportes;
  }

  /**
   * Obtener un reporte por ID
   */
  async findOne(id: number) {
    const reporte = await this.prisma.resumenMensual.findUnique({
      where: { id },
      include: {
        funcionario: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            cargo: true,
            dependencia: true,
          },
        },
      },
    });

    if (!reporte) {
      throw new NotFoundException(`Reporte con ID ${id} no encontrado`);
    }

    return reporte;
  }

  /**
   * Obtener reportes de un funcionario
   */
  async findByFuncionario(funcionarioId: number) {
    const funcionario = await this.prisma.funcionario.findUnique({
      where: { id: funcionarioId },
    });

    if (!funcionario) {
      throw new NotFoundException(`Funcionario con ID ${funcionarioId} no encontrado`);
    }

    const reportes = await this.prisma.resumenMensual.findMany({
      where: { funcionarioId },
      include: {
        funcionario: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            cargo: true,
            dependencia: true,
          },
        },
      },
      orderBy: [
        { anio: 'desc' },
        { mes: 'desc' },
      ],
    });

    return reportes;
  }

  /**
   * Descargar PDF del reporte
   */
  async descargarPDF(id: number, res: Response) {
    const reporte = await this.findOne(id);

    // Obtener marcajes del periodo
    const fechaInicio = new Date(reporte.anio, reporte.mes - 1, 1);
    const fechaFin = new Date(reporte.anio, reporte.mes, 0);

    const marcajes = await this.prisma.asistencia.findMany({
      where: {
        funcionarioId: reporte.funcionarioId,
        fecha: {
          gte: fechaInicio,
          lte: fechaFin,
        },
      },
      orderBy: [
        { fecha: 'asc' },
        { horaMarcaje: 'asc' },
      ],
    });

    // Preparar datos para el PDF
    const datosReporte = {
      funcionario: {
        nombre: reporte.funcionario.nombre,
        apellido: reporte.funcionario.apellido,
        cargo: reporte.funcionario.cargo,
        dependencia: reporte.funcionario.dependencia,
      },
      periodo: {
        mes: PDFGenerator.obtenerNombreMes(reporte.mes),
        anio: reporte.anio,
      },
      resumen: {
        totalDiasTrabajados: reporte.totalDiasTrabajados,
        totalMinutosTardanza: reporte.totalMinutosTardanza,
        totalMinutosTrabajados: reporte.totalMinutosTrabajados,
        totalAusencias: reporte.totalAusencias,
        totalPermisos: reporte.totalPermisos,
      },
      marcajes: marcajes.map(m => ({
        fecha: m.fecha.toISOString().split('T')[0],
        tipoMarcaje: m.tipoMarcaje,
        horaMarcaje: m.horaMarcaje.toTimeString().substring(0, 5),
        minutosTardanza: m.minutosTardanza,
      })),
    };

    // Generar el PDF
    await PDFGenerator.generarReporteMensual(datosReporte, res);
  }

  /**
   * Regenerar un reporte (recalcular estadísticas)
   */
  async regenerarReporte(id: number) {
    const reporteExistente = await this.findOne(id);

    // Obtener marcajes del periodo
    const fechaInicio = new Date(reporteExistente.anio, reporteExistente.mes - 1, 1);
    const fechaFin = new Date(reporteExistente.anio, reporteExistente.mes, 0);

    const marcajes = await this.prisma.asistencia.findMany({
      where: {
        funcionarioId: reporteExistente.funcionarioId,
        fecha: {
          gte: fechaInicio,
          lte: fechaFin,
        },
      },
    });

    // Recalcular estadísticas
    const diasUnicos = new Set(marcajes.map(m => m.fecha.toISOString().split('T')[0])).size;
    const totalMinutosTardanza = marcajes.reduce((sum, m) => sum + m.minutosTardanza, 0);
    const totalMinutosTrabajados = diasUnicos * 480;

    // Actualizar el reporte
    const reporteActualizado = await this.prisma.resumenMensual.update({
      where: { id },
      data: {
        totalDiasTrabajados: diasUnicos,
        totalMinutosTardanza,
        totalMinutosTrabajados,
        fechaGeneracion: new Date(),
      },
      include: {
        funcionario: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            cargo: true,
            dependencia: true,
          },
        },
      },
    });

    return reporteActualizado;
  }

  /**
   * Eliminar un reporte
   */
  async remove(id: number) {
    const reporte = await this.findOne(id);

    await this.prisma.resumenMensual.delete({
      where: { id },
    });

    return {
      message: `Reporte del mes ${reporte.mes}/${reporte.anio} eliminado exitosamente`,
    };
  }
}