import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto): Promise<{
        accessToken: string;
        usuario: {
            id: number;
            username: string;
            rol: import(".prisma/client").$Enums.RolUsuario;
            funcionario: {
                nombre: string;
                apellido: string;
                cargo: string;
                dependencia: string;
                id: number;
                estado: boolean;
                createdAt: Date;
                updatedAt: Date;
                usuarioId: number;
                telegramChatId: string | null;
                facialDataRegistered: boolean;
            } | null;
        };
    }>;
    register(registerDto: RegisterDto): Promise<{
        id: number;
        username: string;
        rol: import(".prisma/client").$Enums.RolUsuario;
        funcionario: {
            nombre: string;
            apellido: string;
            cargo: string;
            dependencia: string;
            id: number;
            estado: boolean;
            createdAt: Date;
            updatedAt: Date;
            usuarioId: number;
            telegramChatId: string | null;
            facialDataRegistered: boolean;
        } | null;
    }>;
    getProfile(user: any): {
        id: any;
        username: any;
        rol: any;
        funcionario: any;
    };
    test(): {
        message: string;
        timestamp: string;
    };
}
