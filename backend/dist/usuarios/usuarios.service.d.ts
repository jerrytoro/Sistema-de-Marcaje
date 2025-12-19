import { PrismaService } from '../database/prisma.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
export declare class UsuariosService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createUsuarioDto: CreateUsuarioDto): Promise<{
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
        username: string;
        rol: import(".prisma/client").$Enums.RolUsuario;
        id: number;
        estado: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(): Promise<{
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
        username: string;
        rol: import(".prisma/client").$Enums.RolUsuario;
        id: number;
        estado: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: number): Promise<{
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
        username: string;
        rol: import(".prisma/client").$Enums.RolUsuario;
        id: number;
        estado: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: number, updateUsuarioDto: UpdateUsuarioDto): Promise<{
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
        username: string;
        rol: import(".prisma/client").$Enums.RolUsuario;
        id: number;
        estado: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    changePassword(id: number, changePasswordDto: ChangePasswordDto, requestUserId: number): Promise<{
        message: string;
    }>;
    toggleEstado(id: number, estado: boolean): Promise<{
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
        username: string;
        rol: import(".prisma/client").$Enums.RolUsuario;
        id: number;
        estado: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
    hardDelete(id: number): Promise<{
        message: string;
    }>;
}
