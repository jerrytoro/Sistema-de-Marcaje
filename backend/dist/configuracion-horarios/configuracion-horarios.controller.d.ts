import { ConfiguracionHorariosService } from './configuracion-horarios.service';
import { UpdateHorarioDto, UpdateAllHorariosDto } from './dto/update-horario.dto';
import { TipoMarcaje } from '@prisma/client';
export declare class ConfiguracionHorariosController {
    private readonly configuracionHorariosService;
    constructor(configuracionHorariosService: ConfiguracionHorariosService);
    findAll(): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        tipoMarcaje: import(".prisma/client").$Enums.TipoMarcaje;
        horaProgramada: string;
        toleranciaMinutos: number;
    }[]>;
    validar(): Promise<{
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
    findOne(tipoMarcaje: TipoMarcaje): Promise<{
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
    update(tipoMarcaje: TipoMarcaje, updateHorarioDto: UpdateHorarioDto): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        tipoMarcaje: import(".prisma/client").$Enums.TipoMarcaje;
        horaProgramada: string;
        toleranciaMinutos: number;
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
    verificarConflictos(tipoMarcaje: TipoMarcaje, hora: string): Promise<{
        tipoMarcaje: "INGRESO_MANANA" | "SALIDA_DESCANSO" | "INGRESO_TARDE" | "SALIDA_FINAL";
        horaProgramada: string;
        diferencia: string;
    }[]>;
}
