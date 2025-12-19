import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../database/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from './strategies/jwt.strategy';

/**
 * Servicio de Autenticación
 */
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  /**
   * Login de usuario
   */
  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;

    // Buscar usuario
    const usuario = await this.prisma.usuario.findUnique({
      where: { username },
      include: {
        funcionario: true,
      },
    });

    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, usuario.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar que el usuario esté activo
    if (!usuario.estado) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    // Generar token
    const payload: JwtPayload = {
      sub: usuario.id,
      username: usuario.username,
      rol: usuario.rol,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      usuario: {
        id: usuario.id,
        username: usuario.username,
        rol: usuario.rol,
        funcionario: usuario.funcionario,
      },
    };
  }

  /**
   * Registro de nuevo usuario
   */
  async register(registerDto: RegisterDto) {
    const { username, password, rol, nombre, apellido, cargo, dependencia } = registerDto;

    // Verificar si el usuario ya existe
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

    return {
      id: usuario.id,
      username: usuario.username,
      rol: usuario.rol,
      funcionario: usuario.funcionario,
    };
  }

  /**
   * Validar usuario por ID
   */
  async validateUser(userId: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: userId },
      include: {
        funcionario: true,
      },
    });

    if (!usuario || !usuario.estado) {
      throw new UnauthorizedException('Usuario no autorizado');
    }

    return usuario;
  }
}
