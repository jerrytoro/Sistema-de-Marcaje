type RolUsuario = 'ADMIN' | 'RRHH' | 'FUNCIONARIO';
export declare class UpdateUsuarioDto {
    username?: string;
    rol?: RolUsuario;
    estado?: boolean;
    nombre?: string;
    apellido?: string;
    cargo?: string;
    dependencia?: string;
}
export {};
