import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { ReportesService } from './reportes.service';
import { GenerarReporteDto } from './dto/generar-reporte.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

// Definir RolUsuario como type
type RolUsuario = 'ADMIN' | 'RRHH' | 'FUNCIONARIO';

/**
 * Controlador de Reportes
 */
@Controller('reportes')
@UseGuards(RolesGuard)
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  /**
   * POST /api/reportes/generar
   * Generar un nuevo reporte mensual
   * ADMIN y RRHH
   */
  @Post('generar')
  @Roles('ADMIN', 'RRHH')
  generarReporte(@Body() generarReporteDto: GenerarReporteDto) {
    return this.reportesService.generarReporte(generarReporteDto);
  }

  /**
   * GET /api/reportes
   * Listar todos los reportes
   * ADMIN y RRHH
   */
  @Get()
  @Roles('ADMIN', 'RRHH')
  findAll() {
    return this.reportesService.findAll();
  }

  /**
   * GET /api/reportes/funcionario/:id
   * Obtener reportes de un funcionario
   * ADMIN y RRHH
   */
  @Get('funcionario/:id')
  @Roles('ADMIN', 'RRHH')
  findByFuncionario(@Param('id', ParseIntPipe) id: number) {
    return this.reportesService.findByFuncionario(id);
  }

  /**
   * GET /api/reportes/:id
   * Obtener un reporte específico
   * ADMIN y RRHH
   */
  @Get(':id')
  @Roles('ADMIN', 'RRHH')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.reportesService.findOne(id);
  }

  /**
   * GET /api/reportes/:id/descargar
   * Descargar PDF del reporte
   * ADMIN y RRHH
   */
  @Get(':id/descargar')
  @Roles('ADMIN', 'RRHH')
  async descargarPDF(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    return this.reportesService.descargarPDF(id, res);
  }

  /**
   * POST /api/reportes/:id/regenerar
   * Regenerar un reporte (recalcular)
   * Solo ADMIN
   */
  @Post(':id/regenerar')
  @Roles('ADMIN')
  regenerarReporte(@Param('id', ParseIntPipe) id: number) {
    return this.reportesService.regenerarReporte(id);
  }

  /**
   * DELETE /api/reportes/:id
   * Eliminar un reporte
   * Solo ADMIN
   */
  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.reportesService.remove(id);
  }
}