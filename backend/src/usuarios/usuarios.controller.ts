import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
type RolUsuario = 'ADMIN' | 'RRHH' | 'FUNCIONARIO';

/**
 * Controlador de Usuarios
 * Todas las rutas están protegidas por JwtAuthGuard (configurado globalmente)
 */
@Controller('usuarios')
@UseGuards(RolesGuard)
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  /**
   * POST /api/usuarios
   * Crear un nuevo usuario
   * Solo ADMIN
   */
  @Post()
  @Roles('ADMIN')
  create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuariosService.create(createUsuarioDto);
  }

  /**
   * GET /api/usuarios
   * Listar todos los usuarios
   * ADMIN y RRHH
   */
  @Get()
  @Roles('ADMIN', 'RRHH')
  findAll() {
    return this.usuariosService.findAll();
  }

  /**
   * GET /api/usuarios/:id
   * Obtener un usuario específico
   * ADMIN y RRHH
   */
  @Get(':id')
  @Roles('ADMIN', 'RRHH')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.findOne(id);
  }

  /**
   * PATCH /api/usuarios/:id
   * Actualizar un usuario
   * Solo ADMIN
   */
  @Patch(':id')
  @Roles('ADMIN')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUsuarioDto: UpdateUsuarioDto,
  ) {
    return this.usuariosService.update(id, updateUsuarioDto);
  }

  /**
   * PATCH /api/usuarios/:id/password
   * Cambiar contraseña
   * ADMIN o el propio usuario
   */
  @Patch(':id/password')
  changePassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() changePasswordDto: ChangePasswordDto,
    @CurrentUser('id') userId: number,
    @CurrentUser('rol') userRol: RolUsuario,
  ) {
    // Verificar que sea ADMIN o el propio usuario
    if (userRol !== 'ADMIN' && userId !== id) {
      throw new Error('No tienes permiso para cambiar esta contraseña');
    }

    return this.usuariosService.changePassword(id, changePasswordDto, userId);
  }

  /**
   * PATCH /api/usuarios/:id/estado
   * Activar/Desactivar usuario
   * Solo ADMIN
   */
  @Patch(':id/estado')
  @Roles('ADMIN')
  toggleEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body('estado') estado: boolean,
  ) {
    return this.usuariosService.toggleEstado(id, estado);
  }

  /**
   * DELETE /api/usuarios/:id
   * Desactivar usuario (soft delete)
   * Solo ADMIN
   */
  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.remove(id);
  }

  /**
   * DELETE /api/usuarios/:id/hard
   * Eliminar permanentemente
   * Solo ADMIN
   */
  @Delete(':id/hard')
  @Roles('ADMIN')
  hardDelete(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.hardDelete(id);
  }
}
