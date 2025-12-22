import { PrismaService } from '../database/prisma.service';
import { CreateAsistenciaDto } from './dto/create-asistencia.dto';
import { UpdateAsistenciaDto } from './dto/update-asistencia.dto';
export declare class AsistenciasService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createAsistenciaDto: CreateAsistenciaDto): Promise<{
        funcionario: {
            nombre: string;
            apellido: string;
            cargo: string;
            dependencia: string;
            id: number;
        };
    } & {
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
    }>;
    findAll(limit?: number, offset?: number): Promise<({
        funcionario: {
            nombre: string;
            apellido: string;
            cargo: string;
            dependencia: string;
            id: number;
        };
    } & {
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
    })[]>;
    findOne(id: number): Promise<{
        funcionario: {
            nombre: string;
            apellido: string;
            cargo: string;
            dependencia: string;
            id: number;
        };
    } & {
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
    }>;
    findByFuncionario(funcionarioId: number, mes?: number, anio?: number): Promise<({
        funcionario: {
            nombre: string;
            apellido: string;
            cargo: string;
            dependencia: string;
            id: number;
        };
    } & {
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
    })[]>;
    findToday(): Promise<({
        funcionario: {
            nombre: string;
            apellido: string;
            cargo: string;
            dependencia: string;
            id: number;
        };
    } & {
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
    })[]>;
    findByDate(fecha: string): Promise<({
        funcionario: {
            nombre: string;
            apellido: string;
            cargo: string;
            dependencia: string;
            id: number;
        };
    } & {
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
    })[]>;
    findByMonth(mes: number, anio: number): Promise<({
        funcionario: {
            nombre: string;
            apellido: string;
            cargo: string;
            dependencia: string;
            id: number;
        };
    } & {
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
    })[]>;
    update(id: number, updateAsistenciaDto: UpdateAsistenciaDto): Promise<{
        funcionario: {
            nombre: string;
            apellido: string;
            cargo: string;
            dependencia: string;
            id: number;
        };
    } & {
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
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
    getEstadisticas(mes?: number, anio?: number): Promise<{
        totalMarcajes: number;
        totalTardanzas: number;
        minutosTardanzaTotal: number;
        minutosTardanzaPromedio: number;
    }>;
}
