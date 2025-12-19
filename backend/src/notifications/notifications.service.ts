import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { TelegramService } from './telegram.service';
import * as QRCode from 'qrcode';
import * as crypto from 'crypto';

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private telegramService: TelegramService,
  ) {}

  /**
   * Generar QR para vincular Telegram
   */
  async generarQRTelegram(funcionarioId: number): Promise<string> {
    // Generar token único
    const token = crypto.randomBytes(32).toString('hex');

    // Calcular fecha de expiración (24 horas)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Guardar token en BD
    await this.prisma.telegramLinkToken.create({
      data: {
        token,
        funcionarioId,
        expiresAt,
        usado: false,
      },
    });

    // Crear deep link de Telegram
    const botUsername = this.telegramService.getBotUsername();
    const deepLink = `https://t.me/${botUsername}?start=${token}`;

    // Generar QR como Data URL
    const qrDataUrl = await QRCode.toDataURL(deepLink, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      width: 300,
      margin: 2,
    });

    return qrDataUrl;
  }

  /**
   * Verificar estado de vinculación de Telegram
   */
  async verificarVinculacionTelegram(funcionarioId: number): Promise<any> {
    const funcionario = await this.prisma.funcionario.findUnique({
      where: { id: funcionarioId },
    });

    if (!funcionario) {
      return {
        vinculado: false,
        chatId: null,
      };
    }

    return {
      vinculado: !!(funcionario as any).telegramChatId,
      chatId: (funcionario as any).telegramChatId || null,
    };
  }

  /**
   * Desvincular cuenta de Telegram
   */
  async desvincularTelegram(funcionarioId: number): Promise<void> {
    await this.prisma.funcionario.update({
      where: { id: funcionarioId },
      data: { telegramChatId: null } as any,
    });
  }

  /**
   * Notificar marcaje exitoso
   */
  async notificarMarcaje(asistenciaId: number): Promise<void> {
    const asistencia = await this.prisma.asistencia.findUnique({
      where: { id: asistenciaId },
      include: {
        funcionario: true,
      },
    });

    if (!asistencia || !asistencia.funcionario) {
      return;
    }

    const chatId = (asistencia.funcionario as any).telegramChatId;

    if (!chatId) {
      console.log(`Funcionario ${asistencia.funcionario.id} no tiene Telegram vinculado`);
      return;
    }

    const hora = new Date(asistencia.horaMarcaje).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });

    await this.telegramService.notificarMarcajeExitoso({
      chatId,
      funcionario: `${asistencia.funcionario.nombre} ${asistencia.funcionario.apellido}`,
      tipoMarcaje: asistencia.tipoMarcaje,
      hora,
      minutosTardanza: asistencia.minutosTardanza,
    });
  }

  /**
   * Webhook genérico para n8n
   */
  async procesarWebhook(event: string, data: any): Promise<any> {
    console.log(`Webhook recibido: ${event}`, data);

    switch (event) {
      case 'marcaje_exitoso':
        if (data.asistenciaId) {
          await this.notificarMarcaje(data.asistenciaId);
        }
        break;

      case 'salida_no_registrada':
        // Será manejado por n8n con cron job
        break;

      case 'recordatorio_marcaje':
        // Será manejado por n8n con cron job
        break;

      case 'alerta_faltas':
        // Será manejado por n8n con cron job
        break;

      default:
        console.warn(`Evento desconocido: ${event}`);
    }

    return { success: true, event, processed: true };
  }

  /**
   * Limpiar tokens expirados (mantenimiento)
   */
  async limpiarTokensExpirados(): Promise<number> {
    const result = await this.prisma.telegramLinkToken.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { usado: true },
        ],
      },
    });

    return result.count;
  }
}
