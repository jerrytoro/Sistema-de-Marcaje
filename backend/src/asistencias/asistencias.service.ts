import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateAsistenciaDto } from './dto/create-asistencia.dto';
import { UpdateAsistenciaDto } from './dto/update-asistencia.dto';

/**
 * Servicio de Asistencias
 */
@Injectable()
export class AsistenciasService {
  constructor(private prisma: PrismaService) {}

  /**
   * Registrar un nuevo marcaje
   */
  async create(createAsistenciaDto: CreateAsistenciaDto) {
    const { funcionarioId, fecha, horaMarcaje, tipoMarcaje, minutosTardanza, verificado, observacion } = createAsistenciaDto;

    // Verificar que el funcionario existe
    const funcionario = await this.prisma.funcionario.findUnique({
      where: { id: funcionarioId },
    });

    if (!funcionario) {
      throw new NotFoundException(`Funcionario con ID ${funcionarioId} no encontrado`);
    }

    // Verificar si ya existe este tipo de marcaje para ese día
    const fechaDate = new Date(fecha);
    const existingMarcaje = await this.prisma.asistencia.findFirst({
      where: {
        funcionarioId,
        fecha: fechaDate,
        tipoMarcaje,
      },
    });

    if (existingMarcaje) {
      throw new BadRequestException(
        `Ya existe un marcaje de tipo ${tipoMarcaje} para el funcionario ${funcionario.nombre} ${funcionario.apellido} en la fecha ${fecha}`,
      );
    }

    // Crear fecha y hora completa
    const [horas, minutos] = horaMarcaje.split(':').map(Number);
    const horaMarcajeCompleta = new Date(fechaDate);
    horaMarcajeCompleta.setHours(horas, minutos, 0, 0);

    // Crear el marcaje
    const asistencia = await this.prisma.asistencia.create({
      data: {
        funcionarioId,
        fecha: fechaDate,
        horaMarcaje: horaMarcajeCompleta,
        tipoMarcaje,
        minutosTardanza: minutosTardanza || 0,
        verificado: verificado !== undefined ? verificado : true,
        observacion: observacion || null,
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

    return asistencia;
  }

  /**
   * Listar todos los marcajes
   */
  async findAll(limit?: number, offset?: number) {
    const asistencias = await this.prisma.asistencia.findMany({
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
        { fecha: 'desc' },
        { horaMarcaje: 'desc' },
      ],
      take: limit,
      skip: offset,
    });

    return asistencias;
  }

  /**
   * Obtener un marcaje por ID
   */
  async findOne(id: number) {
    const asistencia = await this.prisma.asistencia.findUnique({
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

    if (!asistencia) {
      throw new NotFoundException(`Asistencia con ID ${id} no encontrada`);
    }

    return asistencia;
  }

  /**
   * Obtener marcajes de un funcionario
   */
  async findByFuncionario(funcionarioId: number, mes?: number, anio?: number) {
    const funcionario = await this.prisma.funcionario.findUnique({
      where: { id: funcionarioId },
    });

    if (!funcionario) {
      throw new NotFoundException(`Funcionario con ID ${funcionarioId} no encontrado`);
    }

    const whereClause: any = {
      funcionarioId,
    };

    // Filtrar por mes y año si se proporcionan
    if (mes && anio) {
      const fechaInicio = new Date(anio, mes - 1, 1);
      const fechaFin = new Date(anio, mes, 0);

      whereClause.fecha = {
        gte: fechaInicio,
        lte: fechaFin,
      };
    }

    const asistencias = await this.prisma.asistencia.findMany({
      where: whereClause,
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
        { fecha: 'desc' },
        { horaMarcaje: 'desc' },
      ],
    });

    return asistencias;
  }

  /**
   * Obtener marcajes del día actual
   */
  async findToday() {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);

    const asistencias = await this.prisma.asistencia.findMany({
      where: {
        fecha: {
          gte: hoy,
          lt: manana,
        },
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
      orderBy: [
        { horaMarcaje: 'desc' },
      ],
    });

    return asistencias;
  }

  /**
   * Obtener marcajes por fecha específica
   */
  async findByDate(fecha: string) {
    const fechaDate = new Date(fecha);
    const siguienteDia = new Date(fechaDate);
    siguienteDia.setDate(siguienteDia.getDate() + 1);

    const asistencias = await this.prisma.asistencia.findMany({
      where: {
        fecha: {
          gte: fechaDate,
          lt: siguienteDia,
        },
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
      orderBy: [
        { funcionario: { apellido: 'asc' } },
        { horaMarcaje: 'asc' },
      ],
    });

    return asistencias;
  }

  /**
   * Obtener marcajes por mes y año
   */
  async findByMonth(mes: number, anio: number) {
    if (mes < 1 || mes > 12) {
      throw new BadRequestException('El mes debe estar entre 1 y 12');
    }

    const fechaInicio = new Date(anio, mes - 1, 1);
    const fechaFin = new Date(anio, mes, 0);

    const asistencias = await this.prisma.asistencia.findMany({
      where: {
        fecha: {
          gte: fechaInicio,
          lte: fechaFin,
        },
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
      orderBy: [
        { fecha: 'desc' },
        { funcionario: { apellido: 'asc' } },
      ],
    });

    return asistencias;
  }

  /**
   * Actualizar un marcaje
   */
  async update(id: number, updateAsistenciaDto: UpdateAsistenciaDto) {
    const asistencia = await this.prisma.asistencia.findUnique({
      where: { id },
    });

    if (!asistencia) {
      throw new NotFoundException(`Asistencia con ID ${id} no encontrada`);
    }

    // Preparar datos para actualizar
    const dataToUpdate: any = {};

    if (updateAsistenciaDto.fecha) {
      dataToUpdate.fecha = new Date(updateAsistenciaDto.fecha);
    }

    if (updateAsistenciaDto.horaMarcaje) {
      const [horas, minutos] = updateAsistenciaDto.horaMarcaje.split(':').map(Number);
      const horaMarcajeCompleta = new Date(asistencia.fecha);
      horaMarcajeCompleta.setHours(horas, minutos, 0, 0);
      dataToUpdate.horaMarcaje = horaMarcajeCompleta;
    }

    if (updateAsistenciaDto.tipoMarcaje !== undefined) {
      dataToUpdate.tipoMarcaje = updateAsistenciaDto.tipoMarcaje;
    }

    if (updateAsistenciaDto.minutosTardanza !== undefined) {
      dataToUpdate.minutosTardanza = updateAsistenciaDto.minutosTardanza;
    }

    if (updateAsistenciaDto.verificado !== undefined) {
      dataToUpdate.verificado = updateAsistenciaDto.verificado;
    }

    if (updateAsistenciaDto.observacion !== undefined) {
      dataToUpdate.observacion = updateAsistenciaDto.observacion;
    }

    const asistenciaActualizada = await this.prisma.asistencia.update({
      where: { id },
      data: dataToUpdate,
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

    return asistenciaActualizada;
  }

  /**
   * Eliminar un marcaje
   */
  async remove(id: number) {
    const asistencia = await this.prisma.asistencia.findUnique({
      where: { id },
    });

    if (!asistencia) {
      throw new NotFoundException(`Asistencia con ID ${id} no encontrada`);
    }

    await this.prisma.asistencia.delete({
      where: { id },
    });

    return { 
      message: `Marcaje del ${asistencia.fecha.toISOString().split('T')[0]} eliminado exitosamente` 
    };
  }

  /**
   * Obtener estadísticas de marcajes
   */
  async getEstadisticas(mes?: number, anio?: number) {
    const whereClause: any = {};

    if (mes && anio) {
      const fechaInicio = new Date(anio, mes - 1, 1);
      const fechaFin = new Date(anio, mes, 0);

      whereClause.fecha = {
        gte: fechaInicio,
        lte: fechaFin,
      };
    }

    const totalMarcajes = await this.prisma.asistencia.count({
      where: whereClause,
    });

    const tardanzas = await this.prisma.asistencia.aggregate({
      where: {
        ...whereClause,
        minutosTardanza: {
          gt: 0,
        },
      },
      _count: {
        id: true,
      },
      _sum: {
        minutosTardanza: true,
      },
      _avg: {
        minutosTardanza: true,
      },
    });

    return {
      totalMarcajes,
      totalTardanzas: tardanzas._count.id,
      minutosTardanzaTotal: tardanzas._sum.minutosTardanza || 0,
      minutosTardanzaPromedio: Math.round(tardanzas._avg.minutosTardanza || 0),
    };
  }
}