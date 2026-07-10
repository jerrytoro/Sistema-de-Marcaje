import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateAsistenciaDto } from './dto/create-asistencia.dto';
import { UpdateAsistenciaDto } from './dto/update-asistencia.dto';
import { TipoMarcaje } from '@prisma/client';

/**
 * Servicio de Asistencias
 * ✅ VERSIÓN FINAL: Usa ventanas de tiempo para determinar tipo de marcaje
 */
@Injectable()
export class AsistenciasService {
  constructor(private prisma: PrismaService) {}

  /**
   * Determinar tipo de marcaje según la hora y ventanas de tiempo
   */
  private async determinarTipoMarcaje(horaMarcaje: Date): Promise<TipoMarcaje> {
    // Obtener todas las configuraciones de horario
    const configuraciones = await this.prisma.configuracionHorario.findMany();

    // Extraer hora en formato HH:MM
    const horaString = horaMarcaje.toTimeString().substring(0, 5); // "08:35"

    // Buscar en qué ventana cae la hora
    for (const config of configuraciones) {
      if (!config.horaInicioVentana || !config.horaFinVentana) {
        continue; // Saltar si no tiene ventanas configuradas
      }

      if (horaString >= config.horaInicioVentana && horaString <= config.horaFinVentana) {
        return config.tipoMarcaje;
      }
    }

    // Si no cae en ninguna ventana, lanzar error
    throw new BadRequestException(
      `La hora ${horaString} está fuera de las ventanas de marcaje permitidas. ` +
      `Ventanas válidas: 06:30-09:00 (Ingreso Mañana), 11:00-13:00 (Salida Descanso), ` +
      `13:00-15:00 (Ingreso Tarde), 17:00-21:00 (Salida Final)`
    );
  }

  /**
   * Calcular tardanza para INGRESOS
   */
  private calcularTardanza(
    horaMarcaje: Date,
    configuracion: { horaProgramada: string; toleranciaMinutos: number },
  ): number {
    // Extraer hora y minutos del marcaje
    const horasMarcaje = horaMarcaje.getHours();
    const minutosMarcaje = horaMarcaje.getMinutes();
    const minutosTotalesMarcaje = horasMarcaje * 60 + minutosMarcaje;

    // Parsear hora programada "08:00" → [8, 0]
    const [horasEsperadas, minutosEsperados] = configuracion.horaProgramada
      .split(':')
      .map(Number);
    const minutosTotalesEsperados = horasEsperadas * 60 + minutosEsperados;

    // Calcular diferencia (considerando tolerancia)
    const diferencia = minutosTotalesMarcaje - minutosTotalesEsperados - configuracion.toleranciaMinutos;

    // Si llegó tarde (diferencia > 0), retornar minutos de tardanza
    return diferencia > 0 ? diferencia : 0;
  }

  /**
   * Calcular salida anticipada para SALIDAS
   */
  private calcularSalidaAnticipada(
    horaMarcaje: Date,
    configuracion: { horaProgramada: string },
  ): number {
    // Extraer hora y minutos del marcaje
    const horasMarcaje = horaMarcaje.getHours();
    const minutosMarcaje = horaMarcaje.getMinutes();
    const minutosTotalesMarcaje = horasMarcaje * 60 + minutosMarcaje;

    // Parsear hora programada "12:00" → [12, 0]
    const [horasEsperadas, minutosEsperados] = configuracion.horaProgramada
      .split(':')
      .map(Number);
    const minutosTotalesEsperados = horasEsperadas * 60 + minutosEsperados;

    // Calcular diferencia (negativa si salió antes)
    const diferencia = minutosTotalesEsperados - minutosTotalesMarcaje;

    // Si salió antes (diferencia > 0), retornar minutos de salida anticipada
    return diferencia > 0 ? diferencia : 0;
  }

  /**
   * Registrar un nuevo marcaje
   */
  // async create(createAsistenciaDto: CreateAsistenciaDto) {
  //   const { funcionarioId, fecha, horaMarcaje } = createAsistenciaDto;

  //   // Verificar que el funcionario existe
  //   const funcionario = await this.prisma.funcionario.findUnique({
  //     where: { id: funcionarioId },
  //   });

  //   if (!funcionario) {
  //     throw new NotFoundException(`Funcionario con ID ${funcionarioId} no encontrado`);
  //   }

  //   // Crear fecha y hora completa
  //   const [horas, minutos] = horaMarcaje.split(':').map(Number);
  //   const fechaDate = new Date(fecha);
  //   const horaMarcajeCompleta = new Date(fechaDate);
  //   horaMarcajeCompleta.setHours(horas, minutos, 0, 0);

  //   // ✅ DETERMINAR TIPO DE MARCAJE SEGÚN VENTANA DE TIEMPO
  //   const tipoMarcaje = await this.determinarTipoMarcaje(horaMarcajeCompleta);

  //   // Verificar si ya existe este tipo de marcaje para ese día
  //   const existingMarcaje = await this.prisma.asistencia.findFirst({
  //     where: {
  //       funcionarioId,
  //       fecha: fechaDate,
  //       tipoMarcaje,
  //     },
  //   });

  //   if (existingMarcaje) {
  //     throw new BadRequestException(
  //       `Ya existe un marcaje de tipo ${tipoMarcaje} para el funcionario ${funcionario.nombre} ${funcionario.apellido} en la fecha ${fecha}`,
  //     );
  //   }

  //   // ✅ Obtener configuración de horario para este tipo de marcaje
  //   const configuracion = await this.prisma.configuracionHorario.findUnique({
  //     where: { tipoMarcaje },
  //   });

  //   if (!configuracion) {
  //     throw new BadRequestException(
  //       `No existe configuración de horario para el tipo de marcaje ${tipoMarcaje}`,
  //     );
  //   }

  //   // ✅ CALCULAR TARDANZA O SALIDA ANTICIPADA según el tipo
  //   let minutosTardanza = 0;
  //   let minutosSalidaAnticipada = 0;

  //   if (tipoMarcaje === 'INGRESO_MANANA' || tipoMarcaje === 'INGRESO_TARDE') {
  //     // Para INGRESOS: calcular tardanza
  //     minutosTardanza = this.calcularTardanza(horaMarcajeCompleta, configuracion);
  //   } else if (tipoMarcaje === 'SALIDA_DESCANSO' || tipoMarcaje === 'SALIDA_FINAL') {
  //     // Para SALIDAS: calcular salida anticipada
  //     minutosSalidaAnticipada = this.calcularSalidaAnticipada(horaMarcajeCompleta, configuracion);
  //   }

  //   // Crear el marcaje
  //   const asistencia = await this.prisma.asistencia.create({
  //     data: {
  //       funcionarioId,
  //       fecha: fechaDate,
  //       horaMarcaje: horaMarcajeCompleta,
  //       tipoMarcaje,
  //       minutosTardanza,
  //       minutosSalidaAnticipada,
  //       verificado: createAsistenciaDto.verificado !== undefined ? createAsistenciaDto.verificado : true,
  //       observacion: createAsistenciaDto.observacion || null,
  //       metodoMarcaje: 'MANUAL',
  //     },
  //     include: {
  //       funcionario: {
  //         select: {
  //           id: true,
  //           nombre: true,
  //           apellido: true,
  //           cargo: true,
  //           dependencia: true,
  //         },
  //       },
  //     },
  //   });

  //   return asistencia;
  // }
// backend/src/asistencias/asistencias.service.ts

async create(createAsistenciaDto: CreateAsistenciaDto) {
  const { funcionarioId, fecha, horaMarcaje, tipoMarcaje, observacion } = createAsistenciaDto;

  console.log('📥 Recibido del frontend:', { fecha, horaMarcaje, tipoMarcaje });

  // ✅ COMBINAR fecha (YYYY-MM-DD) + horaMarcaje (HH:MM)
  const [year, month, day] = fecha.split('-').map(Number);
  const [hour, minute] = horaMarcaje.split(':').map(Number);
  
  // Crear fechas en zona horaria local
  const horaMarcajeCompleta = new Date(year, month - 1, day, hour, minute, 0);
  const fechaSolo = new Date(year, month - 1, day);

  console.log('✅ Fechas parseadas:', {
    fechaSolo,
    horaMarcajeCompleta
  });

  // Validar ventana de marcaje (esto lanzará un error si está fuera de las ventanas permitidas)
  const tipoMarcajeValidado = await this.determinarTipoMarcaje(horaMarcajeCompleta);

  // Buscar configuración usando el tipo validado
  const config = await this.prisma.configuracionHorario.findUnique({
    where: { tipoMarcaje: tipoMarcajeValidado },
  });

  if (!config) {
    throw new NotFoundException(
      `No existe configuración para ${tipoMarcajeValidado}`,
    );
  }

  // Calcular tardanza o salida anticipada
  const hMarcaje = horaMarcajeCompleta.getHours() * 60 + horaMarcajeCompleta.getMinutes();
  const [h, m] = config.horaProgramada.split(':').map(Number);
  const hEsperada = h * 60 + m;

  let minutosTardanza = 0;
  let minutosSalidaAnticipada = 0;

  if (tipoMarcajeValidado === 'INGRESO_MANANA' || tipoMarcajeValidado === 'INGRESO_TARDE') {
    const diferencia = hMarcaje - hEsperada - config.toleranciaMinutos;
    minutosTardanza = diferencia > 0 ? diferencia : 0;
  } else {
    const diferencia = hEsperada - hMarcaje;
    minutosSalidaAnticipada = diferencia > 0 ? diferencia : 0;
  }

  // Crear asistencia
  const asistencia = await this.prisma.asistencia.create({
    data: {
      funcionarioId,
      fecha: fechaSolo,
      horaMarcaje: horaMarcajeCompleta,  // ✅ Usar fecha + hora combinada
      tipoMarcaje: tipoMarcajeValidado,
      metodoMarcaje: 'MANUAL',
      minutosTardanza,
      minutosSalidaAnticipada,
      verificado: true,
      observacion: observacion || null,
    },
    include: {
      funcionario: true,
    },
  });

  console.log('✅ Asistencia creada:', {
    id: asistencia.id,
    fecha: asistencia.fecha,
    horaMarcaje: asistencia.horaMarcaje
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
   * ✅ MEJORADO: Recalcula tardanza/salida anticipada si se actualiza la hora
   */
  async update(id: number, updateAsistenciaDto: UpdateAsistenciaDto) {
    const asistencia = await this.prisma.asistencia.findUnique({
      where: { id },
    });

    if (!asistencia) {
      throw new NotFoundException(`Asistencia con ID ${id} no encontrada`);
    }

    const dataToUpdate: any = {};

    if (updateAsistenciaDto.fecha) {
      dataToUpdate.fecha = new Date(updateAsistenciaDto.fecha);
    }

    let horaMarcajeActualizada: Date | undefined;
    let tipoMarcajeActualizado: TipoMarcaje | undefined;

    if (updateAsistenciaDto.horaMarcaje) {
      const [horas, minutos] = updateAsistenciaDto.horaMarcaje.split(':').map(Number);
      const fechaBase = dataToUpdate.fecha || asistencia.fecha;
      horaMarcajeActualizada = new Date(fechaBase);
      horaMarcajeActualizada.setHours(horas, minutos, 0, 0);
      dataToUpdate.horaMarcaje = horaMarcajeActualizada;

      // ✅ Si cambia la hora, redeterminar el tipo de marcaje
      tipoMarcajeActualizado = await this.determinarTipoMarcaje(horaMarcajeActualizada);
      dataToUpdate.tipoMarcaje = tipoMarcajeActualizado;
    }

    if (updateAsistenciaDto.tipoMarcaje !== undefined) {
      dataToUpdate.tipoMarcaje = updateAsistenciaDto.tipoMarcaje;
      tipoMarcajeActualizado = updateAsistenciaDto.tipoMarcaje;
    }

    // ✅ Recalcular tardanza/salida anticipada si cambió hora o tipo
    if (horaMarcajeActualizada || tipoMarcajeActualizado) {
      const horaParaCalcular = horaMarcajeActualizada || asistencia.horaMarcaje;
      const tipoParaCalcular = tipoMarcajeActualizado || asistencia.tipoMarcaje;

      const configuracion = await this.prisma.configuracionHorario.findUnique({
        where: { tipoMarcaje: tipoParaCalcular },
      });

      if (configuracion) {
        if (tipoParaCalcular === 'INGRESO_MANANA' || tipoParaCalcular === 'INGRESO_TARDE') {
          dataToUpdate.minutosTardanza = this.calcularTardanza(horaParaCalcular, configuracion);
          dataToUpdate.minutosSalidaAnticipada = 0;
        } else {
          dataToUpdate.minutosSalidaAnticipada = this.calcularSalidaAnticipada(horaParaCalcular, configuracion);
          dataToUpdate.minutosTardanza = 0;
        }
      }
    } else {
      // Si se especificó manualmente
      if (updateAsistenciaDto.minutosTardanza !== undefined) {
        dataToUpdate.minutosTardanza = updateAsistenciaDto.minutosTardanza;
      }
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

    const salidasAnticipadas = await this.prisma.asistencia.aggregate({
      where: {
        ...whereClause,
        minutosSalidaAnticipada: {
          gt: 0,
        },
      },
      _count: {
        id: true,
      },
      _sum: {
        minutosSalidaAnticipada: true,
      },
    });

    return {
      totalMarcajes,
      totalTardanzas: tardanzas._count.id,
      minutosTardanzaTotal: tardanzas._sum.minutosTardanza || 0,
      minutosTardanzaPromedio: Math.round(tardanzas._avg.minutosTardanza || 0),
      totalSalidasAnticipadas: salidasAnticipadas._count.id,
      minutosSalidaAnticipadaTotal: salidasAnticipadas._sum.minutosSalidaAnticipada || 0,
    };
  }
}