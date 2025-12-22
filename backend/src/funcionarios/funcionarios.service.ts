import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { UpdateFuncionarioDto } from './dto/update-funcionario.dto';

/**
 * Servicio de Funcionarios
 */
@Injectable()
export class FuncionariosService {
  constructor(private prisma: PrismaService) {}

  /**
   * Obtener todos los funcionarios con sus usuarios
   */
  async findAll() {
    const funcionarios = await this.prisma.funcionario.findMany({
      include: {
        usuario: {
          select: {
            id: true,
            username: true,
            rol: true,
            estado: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return funcionarios;
  }

  /**
   * Obtener solo funcionarios activos
   */
  async findActive() {
    const funcionarios = await this.prisma.funcionario.findMany({
      where: {
        estado: true,
        usuario: {
          estado: true,
        },
      },
      include: {
        usuario: {
          select: {
            id: true,
            username: true,
            rol: true,
            estado: true,
          },
        },
      },
      orderBy: {
        apellido: 'asc',
      },
    });

    return funcionarios;
  }

  /**
   * Obtener un funcionario por ID
   */
  async findOne(id: number) {
    const funcionario = await this.prisma.funcionario.findUnique({
      where: { id },
      include: {
        usuario: {
          select: {
            id: true,
            username: true,
            rol: true,
            estado: true,
            createdAt: true,
          },
        },
        registrosFaciales: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 5, // Últimos 5 registros faciales
        },
        asistencias: {
          orderBy: {
            fecha: 'desc',
          },
          take: 10, // Últimas 10 asistencias
        },
      },
    });

    if (!funcionario) {
      throw new NotFoundException(`Funcionario con ID ${id} no encontrado`);
    }

    return funcionario;
  }

  /**
   * Obtener funcionario por ID de usuario
   */
  async findByUsuarioId(usuarioId: number) {
    const funcionario = await this.prisma.funcionario.findUnique({
      where: { usuarioId },
      include: {
        usuario: {
          select: {
            id: true,
            username: true,
            rol: true,
            estado: true,
          },
        },
      },
    });

    if (!funcionario) {
      throw new NotFoundException(`Funcionario del usuario ${usuarioId} no encontrado`);
    }

    return funcionario;
  }

  /**
   * Buscar funcionarios por nombre o apellido
   */
  async search(termino: string) {
    const funcionarios = await this.prisma.funcionario.findMany({
      where: {
        OR: [
          {
            nombre: {
              contains: termino,
              mode: 'insensitive',
            },
          },
          {
            apellido: {
              contains: termino,
              mode: 'insensitive',
            },
          },
        ],
      },
      include: {
        usuario: {
          select: {
            id: true,
            username: true,
            rol: true,
            estado: true,
          },
        },
      },
      orderBy: {
        apellido: 'asc',
      },
    });

    return funcionarios;
  }

  /**
   * Filtrar funcionarios por dependencia
   */
  async findByDependencia(dependencia: string) {
    const funcionarios = await this.prisma.funcionario.findMany({
      where: {
        dependencia: {
          contains: dependencia,
          mode: 'insensitive',
        },
      },
      include: {
        usuario: {
          select: {
            id: true,
            username: true,
            rol: true,
            estado: true,
          },
        },
      },
      orderBy: {
        apellido: 'asc',
      },
    });

    return funcionarios;
  }

  /**
   * Filtrar funcionarios por cargo
   */
  async findByCargo(cargo: string) {
    const funcionarios = await this.prisma.funcionario.findMany({
      where: {
        cargo: {
          contains: cargo,
          mode: 'insensitive',
        },
      },
      include: {
        usuario: {
          select: {
            id: true,
            username: true,
            rol: true,
            estado: true,
          },
        },
      },
      orderBy: {
        apellido: 'asc',
      },
    });

    return funcionarios;
  }

  /**
   * Actualizar un funcionario
   */
  async update(id: number, updateFuncionarioDto: UpdateFuncionarioDto) {
    const funcionario = await this.prisma.funcionario.findUnique({
      where: { id },
    });

    if (!funcionario) {
      throw new NotFoundException(`Funcionario con ID ${id} no encontrado`);
    }

    const funcionarioActualizado = await this.prisma.funcionario.update({
      where: { id },
      data: updateFuncionarioDto,
      include: {
        usuario: {
          select: {
            id: true,
            username: true,
            rol: true,
            estado: true,
          },
        },
      },
    });

    return funcionarioActualizado;
  }

  /**
   * Obtener registros faciales de un funcionario
   */
  async getRegistrosFaciales(id: number) {
    const funcionario = await this.prisma.funcionario.findUnique({
      where: { id },
    });

    if (!funcionario) {
      throw new NotFoundException(`Funcionario con ID ${id} no encontrado`);
    }

    const registros = await this.prisma.registroFacial.findMany({
      where: { funcionarioId: id },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return registros;
  }

  /**
   * Obtener asistencias de un funcionario
   */
  async getAsistencias(id: number, mes?: number, anio?: number) {
    const funcionario = await this.prisma.funcionario.findUnique({
      where: { id },
    });

    if (!funcionario) {
      throw new NotFoundException(`Funcionario con ID ${id} no encontrado`);
    }

    const whereClause: any = {
      funcionarioId: id,
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
      orderBy: {
        fecha: 'desc',
      },
    });

    return asistencias;
  }

  /**
   * Obtener estadísticas de un funcionario
   */
  async getEstadisticas(id: number) {
    const funcionario = await this.prisma.funcionario.findUnique({
      where: { id },
    });

    if (!funcionario) {
      throw new NotFoundException(`Funcionario con ID ${id} no encontrado`);
    }

    // Total de asistencias
    const totalAsistencias = await this.prisma.asistencia.count({
      where: { funcionarioId: id },
    });

    // Total de registros faciales
    const totalRegistrosFaciales = await this.prisma.registroFacial.count({
      where: { funcionarioId: id },
    });

    // Tardanzas totales
    const tardanzas = await this.prisma.asistencia.aggregate({
      where: {
        funcionarioId: id,
        minutosTardanza: {
          gt: 0,
        },
      },
      _sum: {
        minutosTardanza: true,
      },
      _count: true,
    });

    return {
      funcionario: {
        id: funcionario.id,
        nombreCompleto: `${funcionario.nombre} ${funcionario.apellido}`,
        cargo: funcionario.cargo,
        dependencia: funcionario.dependencia,
      },
      estadisticas: {
        totalAsistencias,
        totalRegistrosFaciales,
        totalTardanzas: tardanzas._count,
        minutosTardanzaTotal: tardanzas._sum.minutosTardanza || 0,
      },
    };
  }

  /**
   * Listar todas las dependencias únicas
   */
  async getDependencias() {
    const funcionarios = await this.prisma.funcionario.findMany({
      select: {
        dependencia: true,
      },
      distinct: ['dependencia'],
      orderBy: {
        dependencia: 'asc',
      },
    });

    return funcionarios.map((f) => f.dependencia);
  }

  /**
   * Listar todos los cargos únicos
   */
  async getCargos() {
    const funcionarios = await this.prisma.funcionario.findMany({
      select: {
        cargo: true,
      },
      distinct: ['cargo'],
      orderBy: {
        cargo: 'asc',
      },
    });

    return funcionarios.map((f) => f.cargo);
  }
}
