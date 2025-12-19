import { AsistenciasService } from './asistencias.service';
import { CreateAsistenciaDto } from './dto/create-asistencia.dto';
import { UpdateAsistenciaDto } from './dto/update-asistencia.dto';
export declare class AsistenciasController {
    private readonly asistenciasService;
    constructor(asistenciasService: AsistenciasService);
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
        minutosTardanza: number;
        verificado: boolean;
        observacion: string | null;
    }>;
    findAll(limit?: string, offset?: string): Promise<({
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
        minutosTardanza: number;
        verificado: boolean;
        observacion: string | null;
    })[]>;
    getEstadisticas(mes?: string, anio?: string): Promise<{
        totalMarcajes: number;
        totalTardanzas: number;
        minutosTardanzaTotal: number;
        minutosTardanzaPromedio: number;
    }>;
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
        minutosTardanza: number;
        verificado: boolean;
        observacion: string | null;
    })[]>;
    findByFuncionario(id: number, mes?: string, anio?: string): Promise<({
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
        minutosTardanza: number;
        verificado: boolean;
        observacion: string | null;
    }>;
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
        minutosTardanza: number;
        verificado: boolean;
        observacion: string | null;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
