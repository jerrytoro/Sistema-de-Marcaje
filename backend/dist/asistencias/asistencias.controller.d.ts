import { AsistenciasService } from './asistencias.service';
import { CreateAsistenciaDto } from './dto/create-asistencia.dto';
import { UpdateAsistenciaDto } from './dto/update-asistencia.dto';
export declare class AsistenciasController {
    private readonly asistenciasService;
    constructor(asistenciasService: AsistenciasService);
    create(createAsistenciaDto: CreateAsistenciaDto): Promise<{
        funcionario: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            nombre: string;
            apellido: string;
            cargo: string;
            dependencia: string;
            estado: boolean;
            usuarioId: number;
            telegramChatId: string | null;
            facialDataRegistered: boolean;
        };
    } & {
        fecha: Date;
        horaMarcaje: Date;
        tipoMarcaje: import(".prisma/client").$Enums.TipoMarcaje;
        minutosTardanza: number;
        minutosSalidaAnticipada: number;
        verificado: boolean;
        observacion: string | null;
        id: number;
        createdAt: Date;
        funcionarioId: number;
        metodoMarcaje: string | null;
    }>;
    findAll(limit?: string, offset?: string): Promise<({
        funcionario: {
            id: number;
            nombre: string;
            apellido: string;
            cargo: string;
            dependencia: string;
        };
    } & {
        fecha: Date;
        horaMarcaje: Date;
        tipoMarcaje: import(".prisma/client").$Enums.TipoMarcaje;
        minutosTardanza: number;
        minutosSalidaAnticipada: number;
        verificado: boolean;
        observacion: string | null;
        id: number;
        createdAt: Date;
        funcionarioId: number;
        metodoMarcaje: string | null;
    })[]>;
    findToday(): Promise<({
        funcionario: {
            id: number;
            nombre: string;
            apellido: string;
            cargo: string;
            dependencia: string;
        };
    } & {
        fecha: Date;
        horaMarcaje: Date;
        tipoMarcaje: import(".prisma/client").$Enums.TipoMarcaje;
        minutosTardanza: number;
        minutosSalidaAnticipada: number;
        verificado: boolean;
        observacion: string | null;
        id: number;
        createdAt: Date;
        funcionarioId: number;
        metodoMarcaje: string | null;
    })[]>;
    getEstadisticas(mes?: string, anio?: string): Promise<{
        totalMarcajes: number;
        totalTardanzas: number;
        minutosTardanzaTotal: number;
        minutosTardanzaPromedio: number;
        totalSalidasAnticipadas: number;
        minutosSalidaAnticipadaTotal: number;
    }>;
    findByDate(fecha: string): Promise<({
        funcionario: {
            id: number;
            nombre: string;
            apellido: string;
            cargo: string;
            dependencia: string;
        };
    } & {
        fecha: Date;
        horaMarcaje: Date;
        tipoMarcaje: import(".prisma/client").$Enums.TipoMarcaje;
        minutosTardanza: number;
        minutosSalidaAnticipada: number;
        verificado: boolean;
        observacion: string | null;
        id: number;
        createdAt: Date;
        funcionarioId: number;
        metodoMarcaje: string | null;
    })[]>;
    findByMonth(mes: number, anio: number): Promise<({
        funcionario: {
            id: number;
            nombre: string;
            apellido: string;
            cargo: string;
            dependencia: string;
        };
    } & {
        fecha: Date;
        horaMarcaje: Date;
        tipoMarcaje: import(".prisma/client").$Enums.TipoMarcaje;
        minutosTardanza: number;
        minutosSalidaAnticipada: number;
        verificado: boolean;
        observacion: string | null;
        id: number;
        createdAt: Date;
        funcionarioId: number;
        metodoMarcaje: string | null;
    })[]>;
    findByFuncionario(id: number, mes?: string, anio?: string): Promise<({
        funcionario: {
            id: number;
            nombre: string;
            apellido: string;
            cargo: string;
            dependencia: string;
        };
    } & {
        fecha: Date;
        horaMarcaje: Date;
        tipoMarcaje: import(".prisma/client").$Enums.TipoMarcaje;
        minutosTardanza: number;
        minutosSalidaAnticipada: number;
        verificado: boolean;
        observacion: string | null;
        id: number;
        createdAt: Date;
        funcionarioId: number;
        metodoMarcaje: string | null;
    })[]>;
    findOne(id: number): Promise<{
        funcionario: {
            id: number;
            nombre: string;
            apellido: string;
            cargo: string;
            dependencia: string;
        };
    } & {
        fecha: Date;
        horaMarcaje: Date;
        tipoMarcaje: import(".prisma/client").$Enums.TipoMarcaje;
        minutosTardanza: number;
        minutosSalidaAnticipada: number;
        verificado: boolean;
        observacion: string | null;
        id: number;
        createdAt: Date;
        funcionarioId: number;
        metodoMarcaje: string | null;
    }>;
    update(id: number, updateAsistenciaDto: UpdateAsistenciaDto): Promise<{
        funcionario: {
            id: number;
            nombre: string;
            apellido: string;
            cargo: string;
            dependencia: string;
        };
    } & {
        fecha: Date;
        horaMarcaje: Date;
        tipoMarcaje: import(".prisma/client").$Enums.TipoMarcaje;
        minutosTardanza: number;
        minutosSalidaAnticipada: number;
        verificado: boolean;
        observacion: string | null;
        id: number;
        createdAt: Date;
        funcionarioId: number;
        metodoMarcaje: string | null;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
