import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  Body,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { FacialRecognitionService } from './facial-recognition.service';

@Controller('facial-recognition')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FacialRecognitionController {
  constructor(private readonly facialService: FacialRecognitionService) {}

  /**
   * POST /facial-recognition/register/:funcionarioId
   * Registrar datos faciales de un funcionario
   */
  @Post('register/:funcionarioId')
  @Roles('ADMIN', 'RRHH')
  @UseInterceptors(FileInterceptor('foto'))
  async registrarDatosFaciales(
    @Param('funcionarioId', ParseIntPipe) funcionarioId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No se proporcionó ninguna imagen');
    }

    return this.facialService.registrarDatosFaciales(funcionarioId, file.path);
  }

  /**
   * POST /facial-recognition/verify
   * Verificar rostro y retornar funcionario
   */
  @Post('verify')
  @UseInterceptors(FileInterceptor('foto'))
  async verificarRostro(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No se proporcionó ninguna imagen');
    }

    return this.facialService.verificarRostro(file.path);
  }

  /**
   * POST /facial-recognition/marcar
   * Registrar marcaje con reconocimiento facial
   */
  @Post('marcar')
  @UseInterceptors(FileInterceptor('foto'))
  async registrarMarcajeFacial(
    @UploadedFile() file: Express.Multer.File,
    @Body('tipoMarcaje') tipoMarcaje?: string,
  ) {
    if (!file) {
      throw new BadRequestException('No se proporcionó ninguna imagen');
    }

    return this.facialService.registrarMarcajeFacial(file.path, tipoMarcaje);
  }

  /**
   * GET /facial-recognition/:funcionarioId
   * Obtener datos faciales de un funcionario
   */
  @Get(':funcionarioId')
  @Roles('ADMIN', 'RRHH')
  async obtenerDatosFaciales(
    @Param('funcionarioId', ParseIntPipe) funcionarioId: number,
  ) {
    return this.facialService.obtenerDatosFaciales(funcionarioId);
  }

  /**
   * GET /facial-recognition
   * Listar todos los funcionarios con datos faciales
   */
  @Get()
  @Roles('ADMIN', 'RRHH')
  async listarFuncionariosConDatosFaciales() {
    return this.facialService.listarFuncionariosConDatosFaciales();
  }

  /**
   * DELETE /facial-recognition/:funcionarioId
   * Eliminar datos faciales
   */
  @Delete(':funcionarioId')
  @Roles('ADMIN', 'RRHH')
  async eliminarDatosFaciales(
    @Param('funcionarioId', ParseIntPipe) funcionarioId: number,
  ) {
    return this.facialService.eliminarDatosFaciales(funcionarioId);
  }
}