import { PrismaService } from '../database/prisma.service';
import { UpdateHorarioDto, UpdateAllHorariosDto } from './dto/update-horario.dto';
type TipoMarcaje = 'INGRESO_MANANA' | 'SALIDA_DESCANSO' | 'INGRESO_TARDE' | 'SALIDA_FINAL';
export declare class ConfiguracionHorariosService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        tipoMarcaje: import(".prisma/client").$Enums.TipoMarcaje;
        horaProgramada: string;
        toleranciaMinutos: number;
    }[]>;
    findOne(tipoMarcaje: TipoMarcaje): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        tipoMarcaje: import(".prisma/client").$Enums.TipoMarcaje;
        horaProgramada: string;
        toleranciaMinutos: number;
    }>;
    update(tipoMarcaje: TipoMarcaje, updateHorarioDto: UpdateHorarioDto): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        tipoMarcaje: import(".prisma/client").$Enums.TipoMarcaje;
        horaProgramada: string;
        toleranciaMinutos: number;
    }>;
    updateAll(updateAllHorariosDto: UpdateAllHorariosDto): Promise<{
        message: string;
        horarios: any[];
    }>;
    reset(): Promise<{
        message: string;
        horarios: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            tipoMarcaje: import(".prisma/client").$Enums.TipoMarcaje;
            horaProgramada: string;
            toleranciaMinutos: number;
        }[];
    }>;
    verificarConflictos(tipoMarcaje: TipoMarcaje, horaProgramada: string): Promise<{
        tipoMarcaje: TipoMarcaje;
        horaProgramada: string;
        diferencia: string;
    }[]>;
    getSiguienteMarcaje(): Promise<{
        mensaje: string;
        tipoMarcaje?: undefined;
        horaProgramada?: undefined;
        toleranciaMinutos?: undefined;
        minutosRestantes?: undefined;
    } | {
        tipoMarcaje: import(".prisma/client").$Enums.TipoMarcaje;
        horaProgramada: string;
        toleranciaMinutos: number;
        minutosRestantes: number;
        mensaje?: undefined;
    } | {
        tipoMarcaje: import(".prisma/client").$Enums.TipoMarcaje;
        horaProgramada: string;
        toleranciaMinutos: number;
        mensaje: string;
        minutosRestantes?: undefined;
    }>;
    validarJornada(): Promise<{
        valido: boolean;
        errores: string[];
        horarios: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            tipoMarcaje: import(".prisma/client").$Enums.TipoMarcaje;
            horaProgramada: string;
            toleranciaMinutos: number;
        }[];
    }>;
}
export {};
