import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';
import { TelegramService } from './telegram.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly telegramService: TelegramService,
  ) {}

  /**
   * GET /notifications/telegram/qr/:funcionarioId
   * Generar código QR para vincular Telegram
   */
  @Get('telegram/qr/:funcionarioId')
  async generarQRTelegram(
    @Param('funcionarioId', ParseIntPipe) funcionarioId: number,
  ) {
    const qrDataUrl = await this.notificationsService.generarQRTelegram(funcionarioId);
    
    return {
      qrDataUrl,
      botUsername: this.telegramService.getBotUsername(),
      expiresIn: '24 horas',
    };
  }

  /**
   * GET /notifications/telegram/status/:funcionarioId
   * Verificar estado de vinculación de Telegram
   */
  @Get('telegram/status/:funcionarioId')
  async verificarEstadoTelegram(
    @Param('funcionarioId', ParseIntPipe) funcionarioId: number,
  ) {
    return this.notificationsService.verificarVinculacionTelegram(funcionarioId);
  }

  /**
   * DELETE /notifications/telegram/:funcionarioId
   * Desvincular cuenta de Telegram
   */
  @Delete('telegram/:funcionarioId')
  async desvincularTelegram(
    @Param('funcionarioId', ParseIntPipe) funcionarioId: number,
  ) {
    await this.notificationsService.desvincularTelegram(funcionarioId);
    
    return {
      message: 'Cuenta de Telegram desvinculada exitosamente',
    };
  }

  /**
   * POST /notifications/webhook
   * Webhook para eventos (n8n, sistema interno)
   */
  @Post('webhook')
  async procesarWebhook(@Body() body: any) {
    const { event, data } = body;
    
    return this.notificationsService.procesarWebhook(event, data);
  }

  /**
   * POST /notifications/test/:funcionarioId
   * Enviar notificación de prueba
   */
  @Post('test/:funcionarioId')
  async enviarNotificacionPrueba(
    @Param('funcionarioId', ParseIntPipe) funcionarioId: number,
  ) {
    const funcionario = await this.notificationsService['prisma'].funcionario.findUnique({
      where: { id: funcionarioId },
    });

    if (!funcionario) {
      return { error: 'Funcionario no encontrado' };
    }

    const chatId = (funcionario as any).telegramChatId;

    if (!chatId) {
      return { error: 'Funcionario no tiene Telegram vinculado' };
    }

    await this.telegramService.notificarMarcajeExitoso({
      chatId,
      funcionario: `${funcionario.nombre} ${funcionario.apellido}`,
      tipoMarcaje: 'INGRESO_MANANA',
      hora: new Date().toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      minutosTardanza: 0,
    });

    return {
      message: 'Notificación de prueba enviada',
      chatId,
    };
  }

  /**
   * GET /notifications/bot-status
   * Verificar estado del bot
   */
  @Get('bot-status')
  async verificarEstadoBot() {
    return {
      active: this.telegramService.isBotActive(),
      username: this.telegramService.getBotUsername(),
    };
  }
}
