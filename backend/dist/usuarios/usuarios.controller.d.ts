import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
type RolUsuario = 'ADMIN' | 'RRHH' | 'FUNCIONARIO';
export declare class UsuariosController {
    private readonly usuariosService;
    constructor(usuariosService: UsuariosService);
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
    changePassword(id: number, changePasswordDto: ChangePasswordDto, userId: number, userRol: RolUsuario): Promise<{
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
export {};
