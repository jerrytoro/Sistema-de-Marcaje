import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
export interface JwtPayload {
    sub: number;
    username: string;
    rol: string;
}
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private configService;
    private prisma;
    constructor(configService: ConfigService, prisma: PrismaService);
    validate(payload: JwtPayload): Promise<{
        funcionario: {
            nombre: string;
            apellido: string;
            cargo: string;
            dependencia: string;
            id: number;
            estado: boolean;
            createdAt: Date;
            updatedAt: Date;
            usuarioId: number;
            telegramChatId: string | null;
            facialDataRegistered: boolean;
        } | null;
    } & {
        username: string;
        password: string;
        rol: import(".prisma/client").$Enums.RolUsuario;
        id: number;
        estado: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
export {};
