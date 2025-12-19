import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Roles } from './decorators/roles.decorator';
import { RolesGuard } from './guards/roles.guard';

// Definir RolUsuario como type
type RolUsuario = 'ADMIN' | 'RRHH' | 'FUNCIONARIO';

/**
 * Controlador de Autenticación
 */
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * POST /api/auth/login
   * Login de usuario
   */
  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  /**
   * POST /api/auth/register
   * Registro de nuevo usuario (solo ADMIN)
   */
  @Post('register')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }
  //---------------------------------------------//
  // @Public()  // <- Agregar esta línea temporalmente
  // @Post('register')
  // async register(@Body() registerDto: RegisterDto) {
  //   return this.authService.register(registerDto);
  // }

  /**
   * GET /api/auth/profile
   * Obtener perfil del usuario autenticado
   */
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@CurrentUser() user: any) {
    return {
      id: user.id,
      username: user.username,
      rol: user.rol,
      funcionario: user.funcionario,
    };
  }

  /**
   * GET /api/auth/test
   * Endpoint de prueba (público)
   */
  @Public()
  @Get('test')
  test() {
    return {
      message: 'Auth module funcionando correctamente',
      timestamp: new Date().toISOString(),
    };
  }
}