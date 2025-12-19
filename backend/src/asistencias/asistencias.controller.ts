import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { AsistenciasService } from './asistencias.service';
import { CreateAsistenciaDto } from './dto/create-asistencia.dto';
import { UpdateAsistenciaDto } from './dto/update-asistencia.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

// Definir RolUsuario como type
type RolUsuario = 'ADMIN' | 'RRHH' | 'FUNCIONARIO';

/**
 * Controlador de Asistencias
 */
@Controller('asistencias')
@UseGuards(RolesGuard)
export class AsistenciasController {
  constructor(private readonly asistenciasService: AsistenciasService) {}

  /**
   * POST /api/asistencias
   * Registrar una nueva asistencia
   * ADMIN y RRHH
   */
  @Post()
  @Roles('ADMIN', 'RRHH')
  create(@Body() createAsistenciaDto: CreateAsistenciaDto) {
    return this.asistenciasService.create(createAsistenciaDto);
  }

  /**
   * GET /api/asistencias
   * Listar todas las asistencias con paginación
   * ADMIN y RRHH
   */
  @Get()
  @Roles('ADMIN', 'RRHH')
  findAll(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : undefined;
    const offsetNum = offset ? parseInt(offset, 10) : undefined;
    return this.asistenciasService.findAll(limitNum, offsetNum);
  }

  /**
   * GET /api/asistencias/hoy
   * Obtener asistencias del día actual
   * ADMIN y RRHH
   */
  @Get('hoy')
  @Roles('ADMIN', 'RRHH')
  findToday() {
    return this.asistenciasService.findToday();
  }

  /**
   * GET /api/asistencias/estadisticas
   * Obtener estadísticas de asistencias
   * ADMIN y RRHH
   */
  @Get('estadisticas')
  @Roles('ADMIN', 'RRHH')
  getEstadisticas(
    @Query('mes') mes?: string,
    @Query('anio') anio?: string,
  ) {
    const mesNum = mes ? parseInt(mes, 10) : undefined;
    const anioNum = anio ? parseInt(anio, 10) : undefined;
    return this.asistenciasService.getEstadisticas(mesNum, anioNum);
  }

  /**
   * GET /api/asistencias/fecha/:fecha
   * Obtener asistencias por fecha
   * ADMIN y RRHH
   */
  @Get('fecha/:fecha')
  @Roles('ADMIN', 'RRHH')
  findByDate(@Param('fecha') fecha: string) {
    return this.asistenciasService.findByDate(fecha);
  }

  /**
   * GET /api/asistencias/mes/:mes/anio/:anio
   * Obtener asistencias por mes y año
   * ADMIN y RRHH
   */
  @Get('mes/:mes/anio/:anio')
  @Roles('ADMIN', 'RRHH')
  findByMonth(
    @Param('mes', ParseIntPipe) mes: number,
    @Param('anio', ParseIntPipe) anio: number,
  ) {
    return this.asistenciasService.findByMonth(mes, anio);
  }

  /**
   * GET /api/asistencias/funcionario/:id
   * Obtener asistencias de un funcionario
   * ADMIN y RRHH
   */
  @Get('funcionario/:id')
  @Roles('ADMIN', 'RRHH')
  findByFuncionario(
    @Param('id', ParseIntPipe) id: number,
    @Query('mes') mes?: string,
    @Query('anio') anio?: string,
  ) {
    const mesNum = mes ? parseInt(mes, 10) : undefined;
    const anioNum = anio ? parseInt(anio, 10) : undefined;
    return this.asistenciasService.findByFuncionario(id, mesNum, anioNum);
  }

  /**
   * GET /api/asistencias/:id
   * Obtener una asistencia específica
   * ADMIN y RRHH
   */
  @Get(':id')
  @Roles('ADMIN', 'RRHH')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.asistenciasService.findOne(id);
  }

  /**
   * PATCH /api/asistencias/:id
   * Actualizar una asistencia
   * Solo ADMIN
   */
  @Patch(':id')
  @Roles('ADMIN')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAsistenciaDto: UpdateAsistenciaDto,
  ) {
    return this.asistenciasService.update(id, updateAsistenciaDto);
  }

  /**
   * DELETE /api/asistencias/:id
   * Eliminar una asistencia
   * Solo ADMIN
   */
  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.asistenciasService.remove(id);
  }
}
