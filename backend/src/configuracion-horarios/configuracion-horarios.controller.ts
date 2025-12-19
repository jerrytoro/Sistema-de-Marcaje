import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ConfiguracionHorariosService } from './configuracion-horarios.service';
import { UpdateHorarioDto, UpdateAllHorariosDto } from './dto/update-horario.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { RolUsuario, TipoMarcaje } from '@prisma/client';

/**
 * Controlador de Configuración de Horarios
 */
@Controller('configuracion-horarios')
@UseGuards(RolesGuard)
export class ConfiguracionHorariosController {
  constructor(
    private readonly configuracionHorariosService: ConfiguracionHorariosService,
  ) {}

  /**
   * GET /api/configuracion-horarios
   * Listar todos los horarios configurados
   * Público (para que funcionarios vean los horarios)
   */
  @Public()
  @Get()
  findAll() {
    return this.configuracionHorariosService.findAll();
  }

  /**
   * GET /api/configuracion-horarios/validar
   * Validar configuración de jornada
   * ADMIN, RRHH
   */
  @Get('validar')
  @Roles(RolUsuario.ADMIN, RolUsuario.RRHH)
  validar() {
    return this.configuracionHorariosService.validarJornada();
  }

  /**
   * GET /api/configuracion-horarios/siguiente
   * Obtener el siguiente marcaje esperado
   * Público (para funcionarios)
   */
  @Public()
  @Get('siguiente')
  getSiguienteMarcaje() {
    return this.configuracionHorariosService.getSiguienteMarcaje();
  }

  /**
   * GET /api/configuracion-horarios/:tipoMarcaje
   * Obtener horario específico
   * Público
   */
  @Public()
  @Get(':tipoMarcaje')
  findOne(@Param('tipoMarcaje') tipoMarcaje: TipoMarcaje) {
    return this.configuracionHorariosService.findOne(tipoMarcaje);
  }

  /**
   * PATCH /api/configuracion-horarios/bulk
   * Actualizar múltiples horarios a la vez
   * Solo ADMIN
   */
  @Patch('bulk')
  @Roles(RolUsuario.ADMIN)
  updateAll(@Body() updateAllHorariosDto: UpdateAllHorariosDto) {
    return this.configuracionHorariosService.updateAll(updateAllHorariosDto);
  }

  /**
   * PATCH /api/configuracion-horarios/:tipoMarcaje
   * Actualizar un horario específico
   * Solo ADMIN
   */
  @Patch(':tipoMarcaje')
  @Roles(RolUsuario.ADMIN)
  update(
    @Param('tipoMarcaje') tipoMarcaje: TipoMarcaje,
    @Body() updateHorarioDto: UpdateHorarioDto,
  ) {
    return this.configuracionHorariosService.update(tipoMarcaje, updateHorarioDto);
  }

  /**
   * POST /api/configuracion-horarios/reset
   * Restablecer a valores por defecto
   * Solo ADMIN
   */
  @Post('reset')
  @Roles(RolUsuario.ADMIN)
  reset() {
    return this.configuracionHorariosService.reset();
  }

  /**
   * GET /api/configuracion-horarios/:tipoMarcaje/conflictos
   * Verificar conflictos de horario
   * ADMIN, RRHH
   */
  @Get(':tipoMarcaje/conflictos/:hora')
  @Roles(RolUsuario.ADMIN, RolUsuario.RRHH)
  verificarConflictos(
    @Param('tipoMarcaje') tipoMarcaje: TipoMarcaje,
    @Param('hora') hora: string,
  ) {
    return this.configuracionHorariosService.verificarConflictos(tipoMarcaje, hora);
  }
}
