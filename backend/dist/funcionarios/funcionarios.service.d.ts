import { PrismaService } from '../database/prisma.service';
import { UpdateFuncionarioDto } from './dto/update-funcionario.dto';
export declare class FuncionariosService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<({
        usuario: {
            username: string;
            rol: import(".prisma/client").$Enums.RolUsuario;
            id: number;
            estado: boolean;
        };
    } & {
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
    })[]>;
    findActive(): Promise<({
        usuario: {
            username: string;
            rol: import(".prisma/client").$Enums.RolUsuario;
            id: number;
            estado: boolean;
        };
    } & {
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
    })[]>;
    findOne(id: number): Promise<{
        usuario: {
            username: string;
            rol: import(".prisma/client").$Enums.RolUsuario;
            id: number;
            estado: boolean;
            createdAt: Date;
        };
        registrosFaciales: {
            facialData: string;
            id: number;
            createdAt: Date;
            funcionarioId: number;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
        }[];
        asistencias: {
            id: number;
            createdAt: Date;
            fecha: Date;
            funcionarioId: number;
            horaMarcaje: Date;
            tipoMarcaje: import(".prisma/client").$Enums.TipoMarcaje;
            metodoMarcaje: string | null;
            minutosTardanza: number;
            verificado: boolean;
            observacion: string | null;
        }[];
    } & {
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
    }>;
    findByUsuarioId(usuarioId: number): Promise<{
        usuario: {
            username: string;
            rol: import(".prisma/client").$Enums.RolUsuario;
            id: number;
            estado: boolean;
        };
    } & {
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
    }>;
    search(termino: string): Promise<({
        usuario: {
            username: string;
            rol: import(".prisma/client").$Enums.RolUsuario;
            id: number;
            estado: boolean;
        };
    } & {
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
    })[]>;
    findByDependencia(dependencia: string): Promise<({
        usuario: {
            username: string;
            rol: import(".prisma/client").$Enums.RolUsuario;
            id: number;
            estado: boolean;
        };
    } & {
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
    })[]>;
    findByCargo(cargo: string): Promise<({
        usuario: {
            username: string;
            rol: import(".prisma/client").$Enums.RolUsuario;
            id: number;
            estado: boolean;
        };
    } & {
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
    })[]>;
    update(id: number, updateFuncionarioDto: UpdateFuncionarioDto): Promise<{
        usuario: {
            username: string;
            rol: import(".prisma/client").$Enums.RolUsuario;
            id: number;
            estado: boolean;
        };
    } & {
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
    }>;
    getRegistrosFaciales(id: number): Promise<{
        facialData: string;
        id: number;
        createdAt: Date;
        funcionarioId: number;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
    }[]>;
    getAsistencias(id: number, mes?: number, anio?: number): Promise<{
        id: number;
        createdAt: Date;
        fecha: Date;
        funcionarioId: number;
        horaMarcaje: Date;
        tipoMarcaje: import(".prisma/client").$Enums.TipoMarcaje;
        metodoMarcaje: string | null;
        minutosTardanza: number;
        verificado: boolean;
        observacion: string | null;
    }[]>;
    getEstadisticas(id: number): Promise<{
        funcionario: {
            id: number;
            nombreCompleto: string;
            cargo: string;
            dependencia: string;
        };
        estadisticas: {
            totalAsistencias: number;
            totalRegistrosFaciales: number;
            totalTardanzas: number;
            minutosTardanzaTotal: number;
        };
    }>;
    getDependencias(): Promise<string[]>;
    getCargos(): Promise<string[]>;
}
