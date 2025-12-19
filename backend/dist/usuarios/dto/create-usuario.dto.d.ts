type RolUsuario = 'ADMIN' | 'RRHH' | 'FUNCIONARIO';
export declare class CreateUsuarioDto {
    username: string;
    password: string;
    rol?: RolUsuario;
    estado?: boolean;
    nombre: string;
    apellido: string;
    cargo: string;
    dependencia: string;
}
export {};
