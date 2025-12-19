import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';

/**
 * Payload del JWT Token
 */
export interface JwtPayload {
  sub: number; // ID del usuario
  username: string;
  rol: string;
}

/**
 * Estrategia JWT para validar tokens
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'default-secret-key',
    });
  }

  /**
   * Valida el payload del token y retorna el usuario
   */
  async validate(payload: JwtPayload) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: payload.sub },
      include: {
        funcionario: true,
      },
    });

    if (!usuario || !usuario.estado) {
      throw new UnauthorizedException('Usuario no autorizado');
    }

    return usuario; // Este usuario se adjunta a req.user
  }
}
