import { ConfiguracionHorariosService } from './configuracion-horarios.service';
import { UpdateHorarioDto, UpdateAllHorariosDto } from './dto/update-horario.dto';
import { TipoMarcaje } from '@prisma/client';
export declare class ConfiguracionHorariosController {
    private readonly configuracionHorariosService;
    constructor(configuracionHorariosService: ConfiguracionHorariosService);
    findAll(): Promise<{
        id: number;
        tipoMarcaje: import(".prisma/client").$Enums.TipoMarcaje;
        horaProgramada: string;
        toleranciaMinutos: number;
        horaInicioVentana: string | null;
        horaFinVentana: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    validar(): Promise<{
        valido: boolean;
        errores: string[];
        horarios: {
            id: number;
            tipoMarcaje: import(".prisma/client").$Enums.TipoMarcaje;
            horaProgramada: string;
            toleranciaMinutos: number;
            horaInicioVentana: string | null;
            horaFinVentana: string | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
    }>;
    getSiguienteMarcaje(): Promise<{
        mensaje: string;
        tipoMarcaje?: undefined;
        horaProgramada?: undefined;
        horaInicioVentana?: undefined;
        horaFinVentana?: undefined;
        toleranciaMinutos?: undefined;
        minutosRestantes?: undefined;
    } | {
        tipoMarcaje: import(".prisma/client").$Enums.TipoMarcaje;
        horaProgramada: string;
        horaInicioVentana: string;
        horaFinVentana: string;
        toleranciaMinutos: number;
        minutosRestantes: number;
        mensaje: string;
    } | {
        tipoMarcaje: import(".prisma/client").$Enums.TipoMarcaje;
        horaProgramada: string;
        horaInicioVentana: string | null;
        horaFinVentana: string | null;
        toleranciaMinutos: number;
        mensaje: string;
        minutosRestantes?: undefined;
    }>;
    findOne(tipoMarcaje: TipoMarcaje): Promise<{
        id: number;
        tipoMarcaje: import(".prisma/client").$Enums.TipoMarcaje;
        horaProgramada: string;
        toleranciaMinutos: number;
        horaInicioVentana: string | null;
        horaFinVentana: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateAll(updateAllHorariosDto: UpdateAllHorariosDto): Promise<{
        message: string;
        horarios: any[];
    }>;
    update(tipoMarcaje: TipoMarcaje, updateHorarioDto: UpdateHorarioDto): Promise<{
        id: number;
        tipoMarcaje: import(".prisma/client").$Enums.TipoMarcaje;
        horaProgramada: string;
        toleranciaMinutos: number;
        horaInicioVentana: string | null;
        horaFinVentana: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    reset(): Promise<{
        message: string;
        horarios: {
            id: number;
            tipoMarcaje: import(".prisma/client").$Enums.TipoMarcaje;
            horaProgramada: string;
            toleranciaMinutos: number;
            horaInicioVentana: string | null;
            horaFinVentana: string | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
    }>;
    verificarConflictos(tipoMarcaje: TipoMarcaje, hora: string): Promise<{
        tipoMarcaje: "INGRESO_MANANA" | "SALIDA_DESCANSO" | "INGRESO_TARDE" | "SALIDA_FINAL";
        horaProgramada: string;
        diferencia: string;
    }[]>;
}
