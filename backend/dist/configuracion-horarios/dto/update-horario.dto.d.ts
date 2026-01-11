export declare class UpdateHorarioDto {
    horaProgramada?: string;
    toleranciaMinutos?: number;
    horaInicioVentana?: string;
    horaFinVentana?: string;
}
export declare class UpdateAllHorariosDto {
    INGRESO_MANANA?: UpdateHorarioDto;
    SALIDA_DESCANSO?: UpdateHorarioDto;
    INGRESO_TARDE?: UpdateHorarioDto;
    SALIDA_FINAL?: UpdateHorarioDto;
}
