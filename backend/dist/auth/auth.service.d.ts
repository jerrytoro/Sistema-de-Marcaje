import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../database/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    login(loginDto: LoginDto): Promise<{
        accessToken: string;
        usuario: {
            id: number;
            username: string;
            rol: import(".prisma/client").$Enums.RolUsuario;
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
        };
    }>;
    register(registerDto: RegisterDto): Promise<{
        id: number;
        username: string;
        rol: import(".prisma/client").$Enums.RolUsuario;
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
    }>;
    validateUser(userId: number): Promise<{
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
