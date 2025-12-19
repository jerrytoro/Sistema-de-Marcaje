type TipoMarcaje = 'INGRESO_MANANA' | 'SALIDA_DESCANSO' | 'INGRESO_TARDE' | 'SALIDA_FINAL';
export declare class UpdateAsistenciaDto {
    fecha?: string;
    horaMarcaje?: string;
    tipoMarcaje?: TipoMarcaje;
    minutosTardanza?: number;
    verificado?: boolean;
    observacion?: string;
}
export {};
