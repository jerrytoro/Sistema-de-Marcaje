type RolUsuario = 'ADMIN' | 'RRHH' | 'FUNCIONARIO';
export declare class RegisterDto {
    username: string;
    password: string;
    rol?: RolUsuario;
    nombre: string;
    apellido: string;
    cargo: string;
    dependencia: string;
}
export {};
