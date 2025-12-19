import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { UpdateHorarioDto, UpdateAllHorariosDto } from './dto/update-horario.dto';

// Importar TipoMarcaje del Prisma generado
type TipoMarcaje = 'INGRESO_MANANA' | 'SALIDA_DESCANSO' | 'INGRESO_TARDE' | 'SALIDA_FINAL';

/**
 * Servicio de Configuración de Horarios
 */
@Injectable()
export class ConfiguracionHorariosService {
  constructor(private prisma: PrismaService) {}

  /**
   * Obtener todos los horarios configurados
   */
  async findAll() {
    const horarios = await this.prisma.configuracionHorario.findMany({
      orderBy: {
        tipoMarcaje: 'asc',
      },
    });

    return horarios;
  }

  /**
   * Obtener horario por tipo de marcaje
   */
  async findOne(tipoMarcaje: TipoMarcaje) {
    const horario = await this.prisma.configuracionHorario.findUnique({
      where: { tipoMarcaje },
    });

    if (!horario) {
      throw new NotFoundException(`Configuración de horario para ${tipoMarcaje} no encontrada`);
    }

    return horario;
  }

  /**
   * Actualizar un horario específico
   */
  async update(tipoMarcaje: TipoMarcaje, updateHorarioDto: UpdateHorarioDto) {
    // Verificar que existe
    await this.findOne(tipoMarcaje);

    const horarioActualizado = await this.prisma.configuracionHorario.update({
      where: { tipoMarcaje },
      data: updateHorarioDto,
    });

    return horarioActualizado;
  }

  /**
   * Actualizar múltiples horarios a la vez
   */
  async updateAll(updateAllHorariosDto: UpdateAllHorariosDto) {
    const updates: any[] = [];

    // Iterar sobre cada tipo de marcaje y actualizar si está presente
    for (const [tipoMarcaje, data] of Object.entries(updateAllHorariosDto)) {
      if (data && Object.keys(data).length > 0) {
        const update = this.prisma.configuracionHorario.update({
          where: { tipoMarcaje: tipoMarcaje as TipoMarcaje },
          data: data as any,
        });
        updates.push(update);
      }
    }

    // Ejecutar todas las actualizaciones en una transacción
    const resultados = await this.prisma.$transaction(updates);

    return {
      message: `${resultados.length} horarios actualizados exitosamente`,
      horarios: resultados,
    };
  }

  /**
   * Restablecer horarios a valores por defecto
   */
  async reset() {
    const horariosDefault = [
      {
        tipoMarcaje: 'INGRESO_MANANA' as TipoMarcaje,
        horaProgramada: '08:00',
        toleranciaMinutos: 0,
      },
      {
        tipoMarcaje: 'SALIDA_DESCANSO' as TipoMarcaje,
        horaProgramada: '12:00',
        toleranciaMinutos: 0,
      },
      {
        tipoMarcaje: 'INGRESO_TARDE' as TipoMarcaje,
        horaProgramada: '14:00',
        toleranciaMinutos: 0,
      },
      {
        tipoMarcaje: 'SALIDA_FINAL' as TipoMarcaje,
        horaProgramada: '18:00',
        toleranciaMinutos: 0,
      },
    ];

    const updates = horariosDefault.map((horario) =>
      this.prisma.configuracionHorario.update({
        where: { tipoMarcaje: horario.tipoMarcaje },
        data: {
          horaProgramada: horario.horaProgramada,
          toleranciaMinutos: horario.toleranciaMinutos,
        },
      }),
    );

    const resultados = await this.prisma.$transaction(updates);

    return {
      message: 'Horarios restablecidos a valores por defecto',
      horarios: resultados,
    };
  }

  /**
   * Verificar si un horario está en conflicto
   */
  async verificarConflictos(tipoMarcaje: TipoMarcaje, horaProgramada: string) {
    const todosLosHorarios = await this.findAll();

    // Convertir hora a minutos para comparar
    const [horas, minutos] = horaProgramada.split(':').map(Number);
    const minutosNuevo = horas * 60 + minutos;

    const conflictos: Array<{
      tipoMarcaje: TipoMarcaje;
      horaProgramada: string;
      diferencia: string;
    }> = [];

    for (const horario of todosLosHorarios) {
      if (horario.tipoMarcaje === tipoMarcaje) continue;

      const [h, m] = horario.horaProgramada.split(':').map(Number);
      const minutosExistente = h * 60 + m;

      // Verificar si hay menos de 30 minutos de diferencia
      const diferencia = Math.abs(minutosNuevo - minutosExistente);
      if (diferencia < 30) {
        conflictos.push({
          tipoMarcaje: horario.tipoMarcaje,
          horaProgramada: horario.horaProgramada,
          diferencia: `${diferencia} minutos`,
        });
      }
    }

    return conflictos;
  }

  /**
   * Obtener el siguiente marcaje esperado según la hora actual
   */
  async getSiguienteMarcaje() {
    const ahora = new Date();
    const horaActual = `${ahora.getHours().toString().padStart(2, '0')}:${ahora.getMinutes().toString().padStart(2, '0')}`;

    const horarios = await this.findAll();

    if (horarios.length === 0) {
      return {
        mensaje: 'No hay horarios configurados',
      };
    }

    // Convertir hora actual a minutos
    const [h, m] = horaActual.split(':').map(Number);
    const minutosActual = h * 60 + m;

    // Encontrar el siguiente marcaje
    for (const horario of horarios) {
      const [hh, mm] = horario.horaProgramada.split(':').map(Number);
      const minutosHorario = hh * 60 + mm;

      // Si aún no ha pasado este horario
      if (minutosActual < minutosHorario + horario.toleranciaMinutos) {
        return {
          tipoMarcaje: horario.tipoMarcaje,
          horaProgramada: horario.horaProgramada,
          toleranciaMinutos: horario.toleranciaMinutos,
          minutosRestantes: minutosHorario - minutosActual,
        };
      }
    }

    // Si ya pasaron todos los horarios, retornar el primero del día siguiente
    const primerHorario = horarios[0];
    if (primerHorario) {
      return {
        tipoMarcaje: primerHorario.tipoMarcaje,
        horaProgramada: primerHorario.horaProgramada,
        toleranciaMinutos: primerHorario.toleranciaMinutos,
        mensaje: 'Todos los marcajes del día completados',
      };
    }

    return {
      mensaje: 'No hay horarios configurados',
    };
  }

  /**
   * Validar formato de jornada completa
   */
  async validarJornada() {
    const horarios = await this.findAll();

    const errores: string[] = [];

    // Verificar que existan los 4 tipos
    const tiposRequeridos: TipoMarcaje[] = [
      'INGRESO_MANANA',
      'SALIDA_DESCANSO',
      'INGRESO_TARDE',
      'SALIDA_FINAL',
    ];

    for (const tipo of tiposRequeridos) {
      if (!horarios.find((h) => h.tipoMarcaje === tipo)) {
        errores.push(`Falta configuración para ${tipo}`);
      }
    }

    // Verificar orden cronológico
    let minutosAnterior = 0;
    for (const horario of horarios) {
      const [h, m] = horario.horaProgramada.split(':').map(Number);
      const minutos = h * 60 + m;

      if (minutos <= minutosAnterior) {
        errores.push(`${horario.tipoMarcaje} debe ser posterior al marcaje anterior`);
      }

      minutosAnterior = minutos;
    }

    return {
      valido: errores.length === 0,
      errores,
      horarios,
    };
  }
}