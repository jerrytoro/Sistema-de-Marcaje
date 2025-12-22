import {
  Controller,
  Post,
  Get,
  Param,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  ParseIntPipe,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { FacialRecognitionService } from './facial-recognition.service';

@Controller('facial-recognition')
export class FacialRecognitionController {
  constructor(
    private readonly facialRecognitionService: FacialRecognitionService,
  ) {}

  /**
   * Registrar datos faciales (Sistema antiguo - 1 foto)
   * POST /facial-recognition/register/:id
   */
  @Post('register/:id')
  @UseInterceptors(FileInterceptor('foto'))
  async registrar(
    @Param('id', ParseIntPipe) funcionarioId: number,
    @UploadedFile() foto: Express.Multer.File,
  ) {
    return this.facialRecognitionService.registrarDatosFaciales(
      funcionarioId,
      foto,
    );
  }

  /**
   * Registrar datos faciales MÚLTIPLES (Sistema mejorado - 5 fotos)
   * POST /facial-recognition/register-multiple/:id
   */
  // @Post('register-multiple/:id')
  // @UseInterceptors(FilesInterceptor('foto', 5)) // Hasta 5 archivos
  // async registrarMultiple(
  //   @Param('id', ParseIntPipe) funcionarioId: number,
  //   @UploadedFiles() fotos: Express.Multer.File[],
  //   @Body() body: any,
  // ) {
  //   return this.facialRecognitionService.registrarMultiple(
  //     funcionarioId,
  //     fotos,
  //     body,
  //   );
  // }
  @Post('register-multiple/:id')
  @UseInterceptors(FilesInterceptor('foto', 5))
  async registrarMultiple(
    @Param('id', ParseIntPipe) funcionarioId: number,
    @UploadedFiles() fotos: Express.Multer.File[],
    @Body() body: any,
  ) {
    // ✅ AGREGAR ESTOS LOGS
    console.log('🎯 ===== CONTROLLER: register-multiple =====');
    console.log('📝 Funcionario ID:', funcionarioId);
    console.log('📝 Fotos recibidas:', fotos?.length);
    console.log('📝 Body recibido:', body);
    console.log('📝 Nombres de archivos:', fotos?.map(f => f.originalname));
    console.log('========================================');
    
    return this.facialRecognitionService.registrarMultiple(
      funcionarioId,
      fotos,
      body,
    );
  }
  /**
   * Verificar rostro y registrar marcaje
   * POST /facial-recognition/marcar
   */
  @Post('marcar')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('foto'))
  async marcar(@UploadedFile() foto: Express.Multer.File) {
    return this.facialRecognitionService.verificarYMarcar(foto);
  }

  /**
   * Obtener estado del reconocimiento facial de un funcionario
   * GET /facial-recognition/status/:id
   */
  @Get('status/:id')
  async obtenerEstado(@Param('id', ParseIntPipe) funcionarioId: number) {
    return this.facialRecognitionService.obtenerEstado(funcionarioId);
  }

  /**
   * Eliminar registros faciales de un funcionario
   * POST /facial-recognition/delete/:id
   */
  @Post('delete/:id')
  async eliminarRegistros(@Param('id', ParseIntPipe) funcionarioId: number) {
    return this.facialRecognitionService.eliminarRegistros(funcionarioId);
  }
}