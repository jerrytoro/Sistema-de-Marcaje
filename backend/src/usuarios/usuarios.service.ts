import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcrypt';

/**
 * Servicio de Usuarios
 */
@Injectable()
export class UsuariosService {
  constructor(private prisma: PrismaService) {}

  /**
   * Crear un nuevo usuario con su funcionario
   */
  async create(createUsuarioDto: CreateUsuarioDto) {
    const { username, password, rol, estado, nombre, apellido, cargo, dependencia } = createUsuarioDto;

    // Verificar si el username ya existe
    const existingUser = await this.prisma.usuario.findUnique({
      where: { username },
    });

    if (existingUser) {
      throw new ConflictException('El username ya está en uso');
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario y funcionario en una transacción
    const usuario = await this.prisma.usuario.create({
      data: {
        username,
        password: hashedPassword,
        rol: rol || 'FUNCIONARIO',
        estado: estado !== undefined ? estado : true,
        funcionario: {
          create: {
            nombre,
            apellido,
            cargo,
            dependencia,
          },
        },
      },
      include: {
        funcionario: true,
      },
    });

    // No retornar la contraseña
    const { password: _, ...usuarioSinPassword } = usuario;
    return usuarioSinPassword;
  }

  /**
   * Obtener todos los usuarios con sus funcionarios
   */
  async findAll() {
    const usuarios = await this.prisma.usuario.findMany({
      include: {
        funcionario: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Eliminar contraseñas de la respuesta
    return usuarios.map(({ password, ...usuario }) => usuario);
  }

  /**
   * Obtener un usuario por ID
   */
  async findOne(id: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
      include: {
        funcionario: true,
      },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    const { password, ...usuarioSinPassword } = usuario;
    return usuarioSinPassword;
  }

  /**
   * Actualizar un usuario
   */
  async update(id: number, updateUsuarioDto: UpdateUsuarioDto) {
    const { username, rol, estado, nombre, apellido, cargo, dependencia } = updateUsuarioDto;

    // Verificar que el usuario existe
    const usuarioExistente = await this.prisma.usuario.findUnique({
      where: { id },
      include: { funcionario: true },
    });

    if (!usuarioExistente) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    // Si se está actualizando el username, verificar que no exista
    if (username && username !== usuarioExistente.username) {
      const usernameEnUso = await this.prisma.usuario.findUnique({
        where: { username },
      });

      if (usernameEnUso) {
        throw new ConflictException('El username ya está en uso');
      }
    }

    // Preparar datos para actualizar
    const dataUsuario: any = {};
    if (username) dataUsuario.username = username;
    if (rol) dataUsuario.rol = rol;
    if (estado !== undefined) dataUsuario.estado = estado;

    const dataFuncionario: any = {};
    if (nombre) dataFuncionario.nombre = nombre;
    if (apellido) dataFuncionario.apellido = apellido;
    if (cargo) dataFuncionario.cargo = cargo;
    if (dependencia) dataFuncionario.dependencia = dependencia;

    // Actualizar en una transacción
    const usuario = await this.prisma.usuario.update({
      where: { id },
      data: {
        ...dataUsuario,
        ...(Object.keys(dataFuncionario).length > 0 && {
          funcionario: {
            update: dataFuncionario,
          },
        }),
      },
      include: {
        funcionario: true,
      },
    });

    const { password, ...usuarioSinPassword } = usuario;
    return usuarioSinPassword;
  }

  /**
   * Cambiar contraseña de un usuario
   */
  async changePassword(id: number, changePasswordDto: ChangePasswordDto, requestUserId: number) {
    const { currentPassword, newPassword } = changePasswordDto;

    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    // Verificar contraseña actual
    const isPasswordValid = await bcrypt.compare(currentPassword, usuario.password);

    if (!isPasswordValid) {
      throw new BadRequestException('Contraseña actual incorrecta');
    }

    // Hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.usuario.update({
      where: { id },
      data: { password: hashedPassword },
    });

    return { message: 'Contraseña actualizada exitosamente' };
  }

  /**
   * Activar o desactivar un usuario
   */
  async toggleEstado(id: number, estado: boolean) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    const usuarioActualizado = await this.prisma.usuario.update({
      where: { id },
      data: { estado },
      include: {
        funcionario: true,
      },
    });

    const { password, ...usuarioSinPassword } = usuarioActualizado;
    return usuarioSinPassword;
  }

  /**
   * Eliminar un usuario (soft delete - solo desactiva)
   */
  async remove(id: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    // Soft delete - solo desactivar
    await this.prisma.usuario.update({
      where: { id },
      data: { estado: false },
    });

    return { message: `Usuario ${usuario.username} desactivado exitosamente` };
  }

  /**
   * Eliminar permanentemente un usuario (hard delete)
   */
  async hardDelete(id: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    // Eliminar permanentemente (cascade eliminará el funcionario)
    await this.prisma.usuario.delete({
      where: { id },
    });

    return { message: `Usuario ${usuario.username} eliminado permanentemente` };
  }
}
