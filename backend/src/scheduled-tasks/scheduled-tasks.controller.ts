import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ScheduledTasksService } from './scheduled-tasks.service';

@Controller('scheduled-tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class ScheduledTasksController {
  constructor(private readonly scheduledTasksService: ScheduledTasksService) {}

  /**
   * GET /scheduled-tasks/status
   * Obtener estado de todas las tareas programadas
   */
  @Get('status')
  getEstadoTareas() {
    return this.scheduledTasksService.getEstadoTareas();
  }

  /**
   * POST /scheduled-tasks/ejecutar
   * Ejecutar una tarea manualmente (para testing)
   */
  @Post('ejecutar')
  async ejecutarTareaManual(@Body('tarea') nombreTarea: string) {
    return this.scheduledTasksService.ejecutarTareaManual(nombreTarea);
  }
}