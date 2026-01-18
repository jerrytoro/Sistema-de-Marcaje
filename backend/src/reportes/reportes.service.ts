import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { GenerarReporteDto } from './dto/generar-reporte.dto';
import { PDFGenerator } from './utils/pdf-generator';
import type { Response } from 'express';

/**
 * Interfaz para marcajes agrupados por día
 */
interface MarcajeDia {
  fecha: string;
  ingresoManana?: { hora: string; tardanza: number };
  salidaDescanso?: { hora: string; anticipada: number };
  ingresoTarde?: { hora: string; tardanza: number };
  salidaFinal?: { hora: string; anticipada: number };
  totalTardanza: number;
  totalSalidaAnticipada: number;
  permisos: number;
  jornada: number; // en minutos
}

/**
 * Servicio de Reportes
 */
@Injectable()
export class ReportesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Agrupar marcajes por día y calcular estadísticas
   */
  private agruparMarcajesPorDia(marcajes: any[]): MarcajeDia[] {
    const diasMap = new Map<string, any[]>();

    // Agrupar marcajes por fecha
    marcajes.forEach(marcaje => {
      const fecha = marcaje.fecha.toISOString().split('T')[0];
      if (!diasMap.has(fecha)) {
        diasMap.set(fecha, []);
      }
      diasMap.get(fecha)!.push(marcaje);
    });

    // Procesar cada día
    const diasTrabajados: MarcajeDia[] = [];

    diasMap.forEach((marcajesDia, fecha) => {
      const dia: MarcajeDia = {
        fecha: this.formatearFecha(fecha),
        totalTardanza: 0,
        totalSalidaAnticipada: 0,
        permisos: 0,
        jornada: 0
      };

      let minutosTrabajados = 0;
      let horaIngresoManana: Date | null = null;
      let horaSalidaFinal: Date | null = null;

      marcajesDia.forEach(marcaje => {
        const hora = marcaje.horaMarcaje.toTimeString().substring(0, 5);
        const tardanza = marcaje.minutosTardanza || 0;
        const salidaAnticipada = marcaje.minutosSalidaAnticipada || 0;

        switch (marcaje.tipoMarcaje) {
          case 'INGRESO_MANANA':
            dia.ingresoManana = { hora, tardanza };
            dia.totalTardanza += tardanza;
            horaIngresoManana = marcaje.horaMarcaje;
            break;

          case 'SALIDA_DESCANSO':
            dia.salidaDescanso = { hora, anticipada: salidaAnticipada };
            dia.totalSalidaAnticipada += salidaAnticipada;
            if (horaIngresoManana) {
              const diffMs = marcaje.horaMarcaje.getTime() - horaIngresoManana.getTime();
              minutosTrabajados += Math.floor(diffMs / 60000);
            }
            break;

          case 'INGRESO_TARDE':
            dia.ingresoTarde = { hora, tardanza };
            dia.totalTardanza += tardanza;
            horaIngresoManana = marcaje.horaMarcaje; // Reiniciar para el turno tarde
            break;

          case 'SALIDA_FINAL':
            dia.salidaFinal = { hora, anticipada: salidaAnticipada };
            dia.totalSalidaAnticipada += salidaAnticipada;
            horaSalidaFinal = marcaje.horaMarcaje;
            if (horaIngresoManana) {
              const diffMs = marcaje.horaMarcaje.getTime() - horaIngresoManana.getTime();
              minutosTrabajados += Math.floor(diffMs / 60000);
            }
            break;
        }
      });

      dia.jornada = minutosTrabajados;
      diasTrabajados.push(dia);
    });

    return diasTrabajados.sort((a, b) => a.fecha.localeCompare(b.fecha));
  }

  /**
   * Formatear fecha de YYYY-MM-DD a DD/MM
   */
  private formatearFecha(fecha: string): string {
    const [anio, mes, dia] = fecha.split('-');
    return `${dia}/${mes}`;
  }

  /**
   * Obtener rango de fechas del periodo
   */
  private obtenerRangoPeriodo(anio: number, mes: number, marcajes: any[]): { inicio: string; fin: string } {
    if (marcajes.length === 0) {
      return { inicio: '01/01', fin: '01/01' };
    }

    const fechas = marcajes.map(m => m.fecha.toISOString().split('T')[0]);
    const fechaMin = fechas[0];
    const fechaMax = fechas[fechas.length - 1];

    return {
      inicio: this.formatearFecha(fechaMin),
      fin: this.formatearFecha(fechaMax)
    };
  }

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
      orderBy: [
        { fecha: 'asc' },
        { horaMarcaje: 'asc' },
      ],
    });

    // Calcular estadísticas
    const diasUnicos = new Set(marcajes.map(m => m.fecha.toISOString().split('T')[0])).size;
    const totalMinutosTardanza = marcajes.reduce((sum, m) => sum + (m.minutosTardanza || 0), 0);
    const totalMinutosSalidaAnticipada = marcajes.reduce((sum, m) => sum + (m.minutosSalidaAnticipada || 0), 0);

    // Calcular minutos trabajados agrupando por día
    const diasTrabajados = this.agruparMarcajesPorDia(marcajes);
    const totalMinutosTrabajados = diasTrabajados.reduce((sum, dia) => sum + dia.jornada, 0);

    // Crear el reporte con fecha de generación
    const reporte = await this.prisma.resumenMensual.create({
      data: {
        funcionarioId,
        anio,
        mes,
        totalDiasTrabajados: diasUnicos,
        totalMinutosTardanza,
        totalMinutosTrabajados,
        totalMinutosSalidaAnticipada,
        totalAusencias: 0, // Por implementar
        totalPermisos: 0, // Por implementar
        reporteGenerado: true,
        fechaGeneracion: new Date(),
        urlReportePdf: null,
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

    return {
      ...reporte,
      fechaGeneracion: reporte.fechaGeneracion?.toISOString() || new Date().toISOString(),
    };
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

    return reportes.map(reporte => ({
      ...reporte,
      fechaGeneracion: reporte.fechaGeneracion?.toISOString() || new Date().toISOString(),
    }));
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

    return {
      ...reporte,
      fechaGeneracion: reporte.fechaGeneracion?.toISOString() || new Date().toISOString(),
    };
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

    return reportes.map(reporte => ({
      ...reporte,
      fechaGeneracion: reporte.fechaGeneracion?.toISOString() || new Date().toISOString(),
    }));
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
      funcionarioId: reporte.funcionario.id,
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

  // ✅ OBTENER HORARIOS DESDE LA BASE DE DATOS
  const configuracionHorarios = await this.prisma.configuracionHorario.findMany({
    orderBy: { tipoMarcaje: 'asc' }
  });

  // Construir objeto de horarios desde la DB
  const horariosMap = configuracionHorarios.reduce((acc, config) => {
    acc[config.tipoMarcaje] = config;
    return acc;
  }, {} as Record<string, any>);

  const horarios = {
    ingresoManana: horariosMap['INGRESO_MANANA']?.horaProgramada || '08:00',
    salidaDescanso: horariosMap['SALIDA_DESCANSO']?.horaProgramada || '12:00',
    ingresoTarde: horariosMap['INGRESO_TARDE']?.horaProgramada || '14:00',
    salidaFinal: horariosMap['SALIDA_FINAL']?.horaProgramada || '18:00',
    toleranciaIngresoManana: horariosMap['INGRESO_MANANA']?.toleranciaMinutos || 0,
    toleranciaIngresoTarde: horariosMap['INGRESO_TARDE']?.toleranciaMinutos || 0
  };

  // Procesar con la lógica correcta
  const datosProcessados = PDFGenerator.procesarMarcajesConLogicaCorrecta(
    marcajes,
    horarios
  );

  // Obtener rango de fechas
  const rangoPeriodo = this.obtenerRangoPeriodo(reporte.anio, reporte.mes, marcajes);

  // Generar el PDF
  await PDFGenerator.generarPDFDesdeReporte(
    {
      nombre: reporte.funcionario.nombre,
      apellido: reporte.funcionario.apellido,
      cargo: reporte.funcionario.cargo,
      dependencia: reporte.funcionario.dependencia,
    },
    {
      mes: this.obtenerNombreMes(reporte.mes),
      anio: reporte.anio,
      fechaInicio: rangoPeriodo.inicio,
      fechaFin: rangoPeriodo.fin,
    },
    {
      totalDiasTrabajados: datosProcessados.diasUnicos,
      totalMinutosTardanza: datosProcessados.totalTardanza,
      totalMinutosTrabajados: datosProcessados.totalJornada,
      totalSalidaAnticipada: datosProcessados.totalSalidaAnticipada,
    },
    datosProcessados.diasTrabajados,
    res
  );
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
        funcionarioId: reporteExistente.funcionario.id,
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

    // Recalcular estadísticas
    const diasUnicos = new Set(marcajes.map(m => m.fecha.toISOString().split('T')[0])).size;
    const totalMinutosTardanza = marcajes.reduce((sum, m) => sum + (m.minutosTardanza || 0), 0);
    const totalMinutosSalidaAnticipada = marcajes.reduce((sum, m) => sum + (m.minutosSalidaAnticipada || 0), 0);
    
    const diasTrabajados = this.agruparMarcajesPorDia(marcajes);
    const totalMinutosTrabajados = diasTrabajados.reduce((sum, dia) => sum + dia.jornada, 0);

    // Actualizar el reporte
    const reporteActualizado = await this.prisma.resumenMensual.update({
      where: { id },
      data: {
        totalDiasTrabajados: diasUnicos,
        totalMinutosTardanza,
        totalMinutosTrabajados,
        totalMinutosSalidaAnticipada,
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

    return {
      ...reporteActualizado,
      fechaGeneracion: reporteActualizado.fechaGeneracion?.toISOString() || new Date().toISOString(),
    };
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

  /**
   * Obtener nombre del mes en español
   */
  private obtenerNombreMes(mes: number): string {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
    ];
    return meses[mes - 1] || 'Desconocido';
  }
}