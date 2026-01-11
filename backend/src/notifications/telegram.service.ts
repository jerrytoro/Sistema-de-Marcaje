import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../database/prisma.service';
import TelegramBot = require('node-telegram-bot-api');

@Injectable()
export class TelegramService implements OnModuleInit {
  private bot: TelegramBot;
  private botUsername: string;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  onModuleInit() {
    const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    this.botUsername = this.configService.get<string>('TELEGRAM_BOT_USERNAME') || '';

    if (!token) {
      console.warn('⚠️  TELEGRAM_BOT_TOKEN no configurado. Bot de Telegram deshabilitado.');
      return;
    }

    try {
      this.bot = new TelegramBot(token, { polling: true });
      this.setupBotCommands();
      console.log('✅ Bot de Telegram iniciado correctamente');
    } catch (error) {
      console.error('❌ Error al iniciar bot de Telegram:', error);
    }
  }

  /**
   * Configurar comandos del bot
   */
  private setupBotCommands() {
    // Comando /start con token de vinculación
    this.bot.onText(/\/start (.+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const token = match ? match[1] : '';

      await this.vincularCuenta(chatId, token);
    });

    // Comando /start sin token
    this.bot.onText(/\/start$/, async (msg) => {
      const chatId = msg.chat.id;
      
      await this.bot.sendMessage(chatId, `
🤖 *Bienvenido al Sistema de Asistencias*

Para vincular tu cuenta:
1. Ingresa al sistema web
2. Ve a tu perfil
3. Escanea el código QR

Una vez vinculado, recibirás notificaciones automáticas de tus marcajes.
      `, { parse_mode: 'Markdown' });
    });

    // Comando /ayuda
    this.bot.onText(/\/ayuda/, async (msg) => {
      const chatId = msg.chat.id;
      
      await this.bot.sendMessage(chatId, `
📋 *Comandos Disponibles*

/start - Vincular cuenta
/estado - Ver estado de vinculación
/desvincular - Desvincular cuenta
/ayuda - Ver esta ayuda

Para más información, contacta a RRHH.
      `, { parse_mode: 'Markdown' });
    });

    // Comando /estado
    this.bot.onText(/\/estado/, async (msg) => {
      const chatId = msg.chat.id;
      
      await this.verificarEstadoVinculacion(chatId);
    });

    // Comando /desvincular
    this.bot.onText(/\/desvincular/, async (msg) => {
      const chatId = msg.chat.id;
      
      await this.desvincularCuenta(chatId);
    });

    // Manejar errores
    this.bot.on('polling_error', (error) => {
      console.error('Error de polling:', error);
    });
  }

  /**
   * Vincular cuenta de Telegram con funcionario
   */
  private async vincularCuenta(chatId: number, token: string) {
    try {
      // Buscar token en BD
      const linkToken = await this.prisma.telegramLinkToken.findFirst({
        where: {
          token,
          usado: false,
          expiresAt: { gt: new Date() },
        },
        include: {
          funcionario: true,
        },
      });

      if (!linkToken) {
        await this.bot.sendMessage(chatId, `
❌ *Código inválido o expirado*

El código QR puede haber expirado. 
Por favor, genera uno nuevo desde tu perfil.
        `, { parse_mode: 'Markdown' });
        return;
      }

      // Vincular Telegram al funcionario
      await this.prisma.funcionario.update({
        where: { id: linkToken.funcionarioId },
        data: { telegramChatId: chatId.toString() } as any,
      });

      // Marcar token como usado
      await this.prisma.telegramLinkToken.update({
        where: { id: linkToken.id },
        data: { usado: true },
      });

      // Confirmar vinculación
      await this.bot.sendMessage(chatId, `
✅ *¡Vinculación exitosa!*

Tu cuenta ha sido vinculada con:
👤 ${linkToken.funcionario.nombre} ${linkToken.funcionario.apellido}
🆔 Funcionario ID: ${linkToken.funcionarioId}
🏢 Cargo: ${linkToken.funcionario.cargo}

Ahora recibirás notificaciones automáticas de tus marcajes.
      `, { parse_mode: 'Markdown' });

    } catch (error) {
      console.error('Error vinculando cuenta:', error);
      await this.bot.sendMessage(chatId, `
❌ Error al vincular cuenta.
Por favor, contacta con soporte técnico.
      `);
    }
  }

  /**
   * Verificar estado de vinculación
   */
  private async verificarEstadoVinculacion(chatId: number) {
    try {
      const funcionario = await this.prisma.funcionario.findFirst({
        where: { telegramChatId: chatId.toString() } as any,
      });

      if (!funcionario) {
        await this.bot.sendMessage(chatId, `
❌ *Cuenta no vinculada*

Tu cuenta de Telegram aún no está vinculada.
Para vincularla:
1. Ingresa al sistema web
2. Ve a tu perfil
3. Escanea el código QR
        `, { parse_mode: 'Markdown' });
        return;
      }

      await this.bot.sendMessage(chatId, `
✅ *Cuenta vinculada correctamente*

👤 ${funcionario.nombre} ${funcionario.apellido}
🏢 ${funcionario.cargo}
📍 ${funcionario.dependencia}
🆔 Funcionario ID: ${funcionario.id}

Estado: Activo
Notificaciones: Habilitadas
      `, { parse_mode: 'Markdown' });

    } catch (error) {
      console.error('Error verificando estado:', error);
      await this.bot.sendMessage(chatId, '❌ Error al verificar estado.');
    }
  }

  /**
   * Desvincular cuenta
   */
  private async desvincularCuenta(chatId: number) {
    try {
      const funcionario = await this.prisma.funcionario.findFirst({
        where: { telegramChatId: chatId.toString() } as any,
      });

      if (!funcionario) {
        await this.bot.sendMessage(chatId, `
❌ No hay ninguna cuenta vinculada a este Telegram.
        `);
        return;
      }

      // Desvincular
      await this.prisma.funcionario.update({
        where: { id: funcionario.id },
        data: { telegramChatId: null } as any,
      });

      await this.bot.sendMessage(chatId, `
✅ *Cuenta desvinculada*

Tu cuenta ha sido desvinculada exitosamente.
Ya no recibirás notificaciones.

Para volver a vincular, escanea el código QR desde tu perfil.
      `, { parse_mode: 'Markdown' });

    } catch (error) {
      console.error('Error desvinculando cuenta:', error);
      await this.bot.sendMessage(chatId, '❌ Error al desvincular cuenta.');
    }
  }

  /**
   * ✅ ACTUALIZADO: Enviar notificación de marcaje exitoso
   * Ahora diferencia entre INGRESOS (tardanza) y SALIDAS (salida anticipada)
   */
  async notificarMarcajeExitoso(data: {
    chatId: string;
    funcionario: string;
    tipoMarcaje: string;
    hora: string;
    minutosTardanza: number;
    minutosSalidaAnticipada?: number;  // ✅ NUEVO campo
  }) {
    if (!this.bot) return;

    const tipoEmoji = this.getTipoMarcajeEmoji(data.tipoMarcaje);
    
    // ✅ LÓGICA DIFERENCIADA: Ingresos vs Salidas
    let estadoText = '';
    
    if (data.tipoMarcaje === 'INGRESO_MANANA' || data.tipoMarcaje === 'INGRESO_TARDE') {
      // Para INGRESOS: Mostrar tardanza
      estadoText = data.minutosTardanza > 0
        ? `⏱️ Tardanza: ${data.minutosTardanza} minutos`
        : '✅ A tiempo';
    } else if (data.tipoMarcaje === 'SALIDA_DESCANSO' || data.tipoMarcaje === 'SALIDA_FINAL') {
      // Para SALIDAS: Mostrar salida anticipada
      const salidaAnt = data.minutosSalidaAnticipada || 0;
      estadoText = salidaAnt > 0
        ? `🔴 Salida anticipada: ${salidaAnt} minutos`
        : '✅ Normal';
    }

    const message = `
✅ *Marcaje Registrado*

👤 ${data.funcionario}
${tipoEmoji} *Tipo:* ${this.formatTipoMarcaje(data.tipoMarcaje)}
🕐 *Hora:* ${data.hora}
${estadoText}

Todo correcto ✅
    `;

    try {
      await this.bot.sendMessage(data.chatId, message, { parse_mode: 'Markdown' });
    } catch (error) {
      console.error('Error enviando notificación:', error);
    }
  }

  /**
   * ✅ ACTUALIZADO: Enviar notificación de salida no registrada
   * Cambio de 60 minutos a 30 minutos de espera
   */
  async notificarSalidaNoRegistrada(data: {
    chatId: string;
    funcionario: string;
    fecha: string;
  }) {
    if (!this.bot) return;

    const message = `
    ⚠️ *Recordatorio de Marcaje*

    👤 ${data.funcionario}
    📅 Fecha: ${data.fecha}

    Han pasado 30 minutos y no has registrado tu salida.
    Por favor, registra tu marcaje.
    `;

    try {
      await this.bot.sendMessage(data.chatId, message, { parse_mode: 'Markdown' });
    } catch (error) {
      console.error('Error enviando notificación:', error);
    }
  }

  /**
   * Enviar recordatorio de marcaje pendiente
   */
  async notificarRecordatorio(data: {
    chatId: string;
    funcionario: string;
    tipoMarcaje: string;
  }) {
    if (!this.bot) return;

    const tipoEmoji = this.getTipoMarcajeEmoji(data.tipoMarcaje);

    const message = `
    ⏰ *Recordatorio de Marcaje*

    👤 ${data.funcionario}
    ${tipoEmoji} Marcaje pendiente: ${this.formatTipoMarcaje(data.tipoMarcaje)}

    Por favor registra tu asistencia.
    `;

    try {
      await this.bot.sendMessage(data.chatId, message, { parse_mode: 'Markdown' });
    } catch (error) {
      console.error('Error enviando recordatorio:', error);
    }
  }

  /**
   * Enviar alerta de 3+ faltas
   */
  async notificarAlertaFaltas(data: {
    chatId: string;
    funcionario: string;
    totalFaltas: number;
    mes: string;
  }) {
    if (!this.bot) return;

    const message = `
    🚨 *Alerta de Asistencia*

    👤 ${data.funcionario}
    📊 Faltas en el mes: ${data.totalFaltas}
    📅 Mes: ${data.mes}

    Tienes 3 o más faltas este mes.
    Por favor, regulariza tu situación en RRHH.
    `;

    try {
      await this.bot.sendMessage(data.chatId, message, { parse_mode: 'Markdown' });
    } catch (error) {
      console.error('Error enviando alerta:', error);
    }
  }

  /**
   * Obtener emoji según tipo de marcaje
   */
  private getTipoMarcajeEmoji(tipo: string): string {
    const emojis: { [key: string]: string } = {
      INGRESO_MANANA: '🌅',
      SALIDA_DESCANSO: '☕',
      INGRESO_TARDE: '☀️',
      SALIDA_FINAL: '🌇',
    };
    return emojis[tipo] || '📍';
  }

  /**
   * Formatear tipo de marcaje
   */
  private formatTipoMarcaje(tipo: string): string {
    const tipos: { [key: string]: string } = {
      INGRESO_MANANA: 'Ingreso Mañana',
      SALIDA_DESCANSO: 'Salida Descanso',
      INGRESO_TARDE: 'Ingreso Tarde',
      SALIDA_FINAL: 'Salida Final',
    };
    return tipos[tipo] || tipo;
  }

  /**
   * Verificar si el bot está activo
   */
  isBotActive(): boolean {
    return this.bot !== undefined;
  }

  /**
   * Obtener username del bot
   */
  getBotUsername(): string {
    return this.botUsername;
  }
}