import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { FuncionariosService } from './funcionarios.service';
import { UpdateFuncionarioDto } from './dto/update-funcionario.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
type RolUsuario = 'ADMIN' | 'RRHH' | 'FUNCIONARIO';

/**
 * Controlador de Funcionarios
 * Todas las rutas están protegidas por JwtAuthGuard (configurado globalmente)
 */
@Controller('funcionarios')
@UseGuards(RolesGuard)
export class FuncionariosController {
  constructor(private readonly funcionariosService: FuncionariosService) {}

  /**
   * GET /api/funcionarios
   * Listar todos los funcionarios
   * ADMIN y RRHH
   */
  @Get()
  @Roles('ADMIN', 'RRHH')
  findAll(@Query('activos') activos?: string) {
    if (activos === 'true') {
      return this.funcionariosService.findActive();
    }
    return this.funcionariosService.findAll();
  }

  /**
   * GET /api/funcionarios/dependencias
   * Listar todas las dependencias
   * ADMIN y RRHH
   */
  @Get('dependencias')
  @Roles('ADMIN', 'RRHH')
  getDependencias() {
    return this.funcionariosService.getDependencias();
  }

  /**
   * GET /api/funcionarios/cargos
   * Listar todos los cargos
   * ADMIN y RRHH
   */
  @Get('cargos')
  @Roles('ADMIN', 'RRHH')
  getCargos() {
    return this.funcionariosService.getCargos();
  }

  /**
   * GET /api/funcionarios/buscar/:termino
   * Buscar funcionarios por nombre o apellido
   * ADMIN y RRHH
   */
  @Get('buscar/:termino')
  @Roles('ADMIN', 'RRHH')
  search(@Param('termino') termino: string) {
    return this.funcionariosService.search(termino);
  }

  /**
   * GET /api/funcionarios/dependencia/:nombre
   * Filtrar por dependencia
   * ADMIN y RRHH
   */
  @Get('dependencia/:nombre')
  @Roles('ADMIN', 'RRHH')
  findByDependencia(@Param('nombre') nombre: string) {
    return this.funcionariosService.findByDependencia(nombre);
  }

  /**
   * GET /api/funcionarios/cargo/:nombre
   * Filtrar por cargo
   * ADMIN y RRHH
   */
  @Get('cargo/:nombre')
  @Roles('ADMIN', 'RRHH')
  findByCargo(@Param('nombre') nombre: string) {
    return this.funcionariosService.findByCargo(nombre);
  }

  /**
   * GET /api/funcionarios/:id
   * Obtener un funcionario específico
   * ADMIN y RRHH
   */
  @Get(':id')
  @Roles('ADMIN', 'RRHH')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.funcionariosService.findOne(id);
  }

  /**
   * GET /api/funcionarios/:id/registros-faciales
   * Obtener registros faciales del funcionario
   * ADMIN y RRHH
   */
  @Get(':id/registros-faciales')
  @Roles('ADMIN', 'RRHH')
  getRegistrosFaciales(@Param('id', ParseIntPipe) id: number) {
    return this.funcionariosService.getRegistrosFaciales(id);
  }

  /**
   * GET /api/funcionarios/:id/asistencias
   * Obtener asistencias del funcionario
   * ADMIN y RRHH
   * Query params opcionales: mes, anio
   */
  @Get(':id/asistencias')
  @Roles('ADMIN', 'RRHH')
  getAsistencias(
    @Param('id', ParseIntPipe) id: number,
    @Query('mes', ParseIntPipe) mes?: number,
    @Query('anio', ParseIntPipe) anio?: number,
  ) {
    return this.funcionariosService.getAsistencias(id, mes, anio);
  }

  /**
   * GET /api/funcionarios/:id/estadisticas
   * Obtener estadísticas del funcionario
   * ADMIN y RRHH
   */
  @Get(':id/estadisticas')
  @Roles('ADMIN', 'RRHH')
  getEstadisticas(@Param('id', ParseIntPipe) id: number) {
    return this.funcionariosService.getEstadisticas(id);
  }

  /**
   * PATCH /api/funcionarios/:id
   * Actualizar un funcionario
   * Solo ADMIN
   */
  @Patch(':id')
  @Roles('ADMIN')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFuncionarioDto: UpdateFuncionarioDto,
  ) {
    return this.funcionariosService.update(id, updateFuncionarioDto);
  }
}
