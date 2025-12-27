import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FacialRecognitionService } from './facial-recognition.service';

@Controller('facial-recognition')
export class FacialRecognitionController {
  constructor(
    private readonly facialRecognitionService: FacialRecognitionService,
  ) {}

  /**
   * Registrar descriptores faciales (procesados en frontend)
   * POST /api/facial-recognition/registrar-descriptores/:id
   */
  @Post('registrar-descriptores/:id')
  @HttpCode(HttpStatus.OK)
  async registrarDescriptores(
    @Param('id', ParseIntPipe) funcionarioId: number,
    @Body() body: any,
  ) {
    console.log('🎯 ===== CONTROLLER: registrar-descriptores =====');
    console.log('📝 Funcionario ID:', funcionarioId);
    console.log('📝 Body recibido:', JSON.stringify(body).substring(0, 200));
    console.log('📝 Descriptores:', body.descriptores?.length);
    console.log('========================================');

    return this.facialRecognitionService.registrarDescriptores(
      funcionarioId,
      body.descriptores,
    );
  }

  /**
   * Verificar descriptor y marcar asistencia
   * POST /api/facial-recognition/verificar-descriptor
   */
  @Post('verificar-descriptor')
  @HttpCode(HttpStatus.OK)
  async verificarDescriptor(@Body() body: any) {
    console.log('🎯 ===== CONTROLLER: verificar-descriptor =====');
    console.log('📝 Descriptor recibido:', body.descriptor?.length, 'valores');
    console.log('========================================');

    return this.facialRecognitionService.verificarDescriptor(body.descriptor);
  }

  /**
   * Obtener estado del reconocimiento facial
   * GET /api/facial-recognition/status/:id
   */
  @Get('status/:id')
  async obtenerEstado(@Param('id', ParseIntPipe) funcionarioId: number) {
    return this.facialRecognitionService.obtenerEstado(funcionarioId);
  }

  /**
   * Eliminar registros faciales
   * POST /api/facial-recognition/delete/:id
   */
  @Post('delete/:id')
  async eliminarRegistros(@Param('id', ParseIntPipe) funcionarioId: number) {
    return this.facialRecognitionService.eliminarRegistros(funcionarioId);
  }
}