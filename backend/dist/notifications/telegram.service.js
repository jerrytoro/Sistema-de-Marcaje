"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../database/prisma.service");
const TelegramBot = require("node-telegram-bot-api");
let TelegramService = class TelegramService {
    configService;
    prisma;
    bot;
    botUsername;
    constructor(configService, prisma) {
        this.configService = configService;
        this.prisma = prisma;
    }
    onModuleInit() {
        const token = this.configService.get('TELEGRAM_BOT_TOKEN');
        this.botUsername = this.configService.get('TELEGRAM_BOT_USERNAME') || '';
        if (!token) {
            console.warn('⚠️  TELEGRAM_BOT_TOKEN no configurado. Bot de Telegram deshabilitado.');
            return;
        }
        try {
            this.bot = new TelegramBot(token, { polling: true });
            this.setupBotCommands();
            console.log('✅ Bot de Telegram iniciado correctamente');
        }
        catch (error) {
            console.error('❌ Error al iniciar bot de Telegram:', error);
        }
    }
    setupBotCommands() {
        this.bot.onText(/\/start (.+)/, async (msg, match) => {
            const chatId = msg.chat.id;
            const token = match ? match[1] : '';
            await this.vincularCuenta(chatId, token);
        });
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
        this.bot.onText(/\/estado/, async (msg) => {
            const chatId = msg.chat.id;
            await this.verificarEstadoVinculacion(chatId);
        });
        this.bot.onText(/\/desvincular/, async (msg) => {
            const chatId = msg.chat.id;
            await this.desvincularCuenta(chatId);
        });
        this.bot.on('polling_error', (error) => {
            console.error('Error de polling:', error);
        });
    }
    async vincularCuenta(chatId, token) {
        try {
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
            await this.prisma.funcionario.update({
                where: { id: linkToken.funcionarioId },
                data: { telegramChatId: chatId.toString() },
            });
            await this.prisma.telegramLinkToken.update({
                where: { id: linkToken.id },
                data: { usado: true },
            });
            await this.bot.sendMessage(chatId, `
✅ *¡Vinculación exitosa!*

Tu cuenta ha sido vinculada con:
👤 ${linkToken.funcionario.nombre} ${linkToken.funcionario.apellido}
🆔 Funcionario ID: ${linkToken.funcionarioId}
🏢 Cargo: ${linkToken.funcionario.cargo}

Ahora recibirás notificaciones automáticas de tus marcajes.
      `, { parse_mode: 'Markdown' });
        }
        catch (error) {
            console.error('Error vinculando cuenta:', error);
            await this.bot.sendMessage(chatId, `
❌ Error al vincular cuenta.
Por favor, contacta con soporte técnico.
      `);
        }
    }
    async verificarEstadoVinculacion(chatId) {
        try {
            const funcionario = await this.prisma.funcionario.findFirst({
                where: { telegramChatId: chatId.toString() },
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
        }
        catch (error) {
            console.error('Error verificando estado:', error);
            await this.bot.sendMessage(chatId, '❌ Error al verificar estado.');
        }
    }
    async desvincularCuenta(chatId) {
        try {
            const funcionario = await this.prisma.funcionario.findFirst({
                where: { telegramChatId: chatId.toString() },
            });
            if (!funcionario) {
                await this.bot.sendMessage(chatId, `
❌ No hay ninguna cuenta vinculada a este Telegram.
        `);
                return;
            }
            await this.prisma.funcionario.update({
                where: { id: funcionario.id },
                data: { telegramChatId: null },
            });
            await this.bot.sendMessage(chatId, `
✅ *Cuenta desvinculada*

Tu cuenta ha sido desvinculada exitosamente.
Ya no recibirás notificaciones.

Para volver a vincular, escanea el código QR desde tu perfil.
      `, { parse_mode: 'Markdown' });
        }
        catch (error) {
            console.error('Error desvinculando cuenta:', error);
            await this.bot.sendMessage(chatId, '❌ Error al desvincular cuenta.');
        }
    }
    async notificarMarcajeExitoso(data) {
        if (!this.bot)
            return;
        const tipoEmoji = this.getTipoMarcajeEmoji(data.tipoMarcaje);
        const tardanzaText = data.minutosTardanza > 0
            ? `⏱️ Tardanza: ${data.minutosTardanza} minutos`
            : '✅ A tiempo';
        const message = `
✅ *Marcaje Registrado*

👤 ${data.funcionario}
${tipoEmoji} *Tipo:* ${this.formatTipoMarcaje(data.tipoMarcaje)}
🕐 *Hora:* ${data.hora}
${tardanzaText}

Todo correcto ✅
    `;
        try {
            await this.bot.sendMessage(data.chatId, message, { parse_mode: 'Markdown' });
        }
        catch (error) {
            console.error('Error enviando notificación:', error);
        }
    }
    async notificarSalidaNoRegistrada(data) {
        if (!this.bot)
            return;
        const message = `
⚠️ *Salida No Registrada*

👤 ${data.funcionario}
📅 Fecha: ${data.fecha}

No registraste tu salida del día de hoy.
Por favor, contacta a RRHH.
    `;
        try {
            await this.bot.sendMessage(data.chatId, message, { parse_mode: 'Markdown' });
        }
        catch (error) {
            console.error('Error enviando notificación:', error);
        }
    }
    async notificarRecordatorio(data) {
        if (!this.bot)
            return;
        const tipoEmoji = this.getTipoMarcajeEmoji(data.tipoMarcaje);
        const message = `
⏰ *Recordatorio de Marcaje*

👤 ${data.funcionario}
${tipoEmoji} Marcaje pendiente: ${this.formatTipoMarcaje(data.tipoMarcaje)}

Por favor registra tu asistencia.
    `;
        try {
            await this.bot.sendMessage(data.chatId, message, { parse_mode: 'Markdown' });
        }
        catch (error) {
            console.error('Error enviando recordatorio:', error);
        }
    }
    async notificarAlertaFaltas(data) {
        if (!this.bot)
            return;
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
        }
        catch (error) {
            console.error('Error enviando alerta:', error);
        }
    }
    getTipoMarcajeEmoji(tipo) {
        const emojis = {
            INGRESO_MANANA: '🌅',
            SALIDA_DESCANSO: '☕',
            INGRESO_TARDE: '☀️',
            SALIDA_FINAL: '🌇',
        };
        return emojis[tipo] || '📍';
    }
    formatTipoMarcaje(tipo) {
        const tipos = {
            INGRESO_MANANA: 'Ingreso Mañana',
            SALIDA_DESCANSO: 'Salida Descanso',
            INGRESO_TARDE: 'Ingreso Tarde',
            SALIDA_FINAL: 'Salida Final',
        };
        return tipos[tipo] || tipo;
    }
    isBotActive() {
        return this.bot !== undefined;
    }
    getBotUsername() {
        return this.botUsername;
    }
};
exports.TelegramService = TelegramService;
exports.TelegramService = TelegramService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        prisma_service_1.PrismaService])
], TelegramService);
//# sourceMappingURL=telegram.service.js.map