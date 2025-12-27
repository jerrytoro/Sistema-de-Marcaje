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
exports.FacialRecognitionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const telegram_service_1 = require("../notifications/telegram.service");
let FacialRecognitionService = class FacialRecognitionService {
    prisma;
    telegramService;
    constructor(prisma, telegramService) {
        this.prisma = prisma;
        this.telegramService = telegramService;
        console.log('🔧 FacialRecognitionService inicializado (modo descriptores)');
    }
    async registrarDescriptores(funcionarioId, descriptores) {
        console.log('\n🔍 ========== INICIO REGISTRO DE DESCRIPTORES ==========');
        console.log('📝 Funcionario ID:', funcionarioId);
        console.log('📝 Cantidad de descriptores recibidos:', descriptores.length);
        try {
            if (!descriptores || descriptores.length !== 5) {
                throw new common_1.BadRequestException(`Se requieren exactamente 5 descriptores, se recibieron ${descriptores?.length || 0}`);
            }
            const funcionario = await this.prisma.funcionario.findUnique({
                where: { id: funcionarioId },
            });
            if (!funcionario) {
                throw new common_1.BadRequestException('Funcionario no encontrado');
            }
            console.log('✅ Funcionario encontrado:', funcionario.nombre, funcionario.apellido);
            console.log('🗑️ Eliminando registros anteriores...');
            await this.prisma.registroFacial.deleteMany({
                where: { funcionarioId },
            });
            console.log('✅ Registros anteriores eliminados');
            const registrosCreados = [];
            for (let i = 0; i < descriptores.length; i++) {
                const { descriptor, instruccion } = descriptores[i];
                console.log(`\n📸 Guardando descriptor ${i + 1}/5`);
                console.log('  📝 Instrucción:', instruccion);
                console.log('  📊 Longitud del descriptor:', descriptor.length);
                if (descriptor.length !== 128) {
                    throw new common_1.BadRequestException(`Descriptor ${i + 1} inválido. Se esperaban 128 valores, se recibieron ${descriptor.length}`);
                }
                const registro = await this.prisma.registroFacial.create({
                    data: {
                        funcionarioId,
                        facialData: JSON.stringify(descriptor),
                        metadata: {
                            instruccion,
                            capturaNumero: i + 1,
                            fechaCaptura: new Date().toISOString(),
                            metodo: 'registro-frontend',
                        },
                    },
                });
                console.log('  ✅ Descriptor guardado con ID:', registro.id);
                registrosCreados.push(registro);
            }
            await this.prisma.funcionario.update({
                where: { id: funcionarioId },
                data: { facialDataRegistered: true },
            });
            console.log('✅ ========== REGISTRO DE DESCRIPTORES COMPLETADO ==========\n');
            return {
                success: true,
                message: 'Registro facial completado exitosamente',
                funcionarioId,
                registrosCreados: registrosCreados.length,
                detalles: registrosCreados.map((r, i) => ({
                    id: r.id,
                    instruccion: descriptores[i].instruccion,
                })),
            };
        }
        catch (error) {
            console.error('\n❌ ERROR EN REGISTRO DE DESCRIPTORES');
            console.error('❌ Mensaje:', error.message);
            throw error;
        }
    }
    async verificarDescriptor(descriptor) {
        console.log('\n🔍 ========== VERIFICACIÓN DE DESCRIPTOR ==========');
        try {
            console.log('📝 Paso 1: Validando descriptor...');
            if (!descriptor || descriptor.length !== 128) {
                throw new common_1.BadRequestException(`Descriptor inválido. Se esperaban 128 valores, se recibieron ${descriptor?.length || 0}`);
            }
            console.log('✅ Descriptor válido: 128 valores');
            console.log('📝 Paso 2: Consultando registros faciales...');
            const todosLosRegistros = await this.prisma.registroFacial.findMany({
                include: {
                    funcionario: {
                        include: {
                            usuario: true,
                        },
                    },
                },
            });
            console.log(`✅ Registros encontrados: ${todosLosRegistros.length}`);
            if (todosLosRegistros.length === 0) {
                console.log('❌ No hay registros faciales en la base de datos');
                return {
                    success: false,
                    message: 'No hay funcionarios registrados con datos faciales',
                };
            }
            console.log('📝 Paso 3: Comparando descriptores...');
            let mejorCoincidencia = null;
            let mejorDistancia = Infinity;
            const UMBRAL = 0.6;
            for (const registro of todosLosRegistros) {
                try {
                    const descriptorGuardado = JSON.parse(registro.facialData);
                    const distancia = this.calcularDistanciaEuclidiana(descriptor, descriptorGuardado);
                    if (distancia < mejorDistancia) {
                        mejorDistancia = distancia;
                        mejorCoincidencia = registro;
                    }
                }
                catch (error) {
                    console.error(`❌ Error al comparar con registro ${registro.id}:`, error.message);
                }
            }
            console.log(`📊 Mejor distancia: ${mejorDistancia.toFixed(4)}, Umbral: ${UMBRAL}`);
            if (!mejorCoincidencia || mejorDistancia > UMBRAL) {
                console.log('❌ Rostro no reconocido. Distancia:', mejorDistancia);
                return {
                    success: false,
                    message: 'Rostro no reconocido',
                    distancia: mejorDistancia,
                    umbral: UMBRAL,
                };
            }
            const confianza = Math.round((1 - mejorDistancia) * 100);
            const funcionario = mejorCoincidencia.funcionario;
            console.log('✅ Rostro reconocido:', funcionario.nombre, funcionario.apellido);
            console.log('📊 Confianza:', confianza + '%');
            console.log('📝 Paso 4: Determinando tipo de marcaje...');
            const tipoMarcaje = await this.determinarTipoMarcaje(funcionario.id);
            console.log('✅ Tipo de marcaje:', tipoMarcaje);
            console.log('📝 Paso 5: Registrando asistencia...');
            const fechaMarcaje = new Date();
            const asistencia = await this.prisma.asistencia.create({
                data: {
                    funcionarioId: funcionario.id,
                    fecha: fechaMarcaje,
                    horaMarcaje: fechaMarcaje,
                    tipoMarcaje: tipoMarcaje,
                    metodoMarcaje: 'FACIAL',
                },
            });
            console.log('✅ Asistencia creada con ID:', asistencia.id);
            console.log('📝 Paso 6: Calculando atraso...');
            await this.calcularAtraso(asistencia.id);
            console.log('✅ Atraso calculado');
            const asistenciaFinal = await this.prisma.asistencia.findUnique({
                where: { id: asistencia.id },
            });
            if (!asistenciaFinal) {
                throw new Error('No se pudo recuperar la asistencia');
            }
            if (funcionario.telegramChatId) {
                console.log('📱 Enviando notificación a Telegram...');
                try {
                    await this.telegramService.notificarMarcajeExitoso({
                        chatId: funcionario.telegramChatId,
                        funcionario: `${funcionario.nombre} ${funcionario.apellido}`,
                        tipoMarcaje: asistenciaFinal.tipoMarcaje,
                        hora: asistenciaFinal.horaMarcaje.toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit',
                        }),
                        minutosTardanza: asistenciaFinal.minutosTardanza || 0,
                    });
                    console.log('✅ Notificación enviada a Telegram');
                }
                catch (error) {
                    console.error('❌ Error al enviar notificación a Telegram:', error.message);
                }
            }
            else {
                console.log('ℹ️  Funcionario no tiene Telegram vinculado, notificación omitida');
            }
            console.log('✅ ========== VERIFICACIÓN COMPLETADA ==========\n');
            return {
                success: true,
                message: `Bienvenido ${funcionario.nombre} ${funcionario.apellido}`,
                asistencia: {
                    id: asistenciaFinal.id,
                    fecha: asistenciaFinal.fecha,
                    tipoMarcaje: asistenciaFinal.tipoMarcaje,
                    minutosTardanza: asistenciaFinal.minutosTardanza || 0,
                },
                funcionario: {
                    id: funcionario.id,
                    nombre: funcionario.nombre,
                    apellido: funcionario.apellido,
                    cargo: funcionario.cargo,
                },
                confianza,
                distancia: mejorDistancia,
                umbral: UMBRAL,
            };
        }
        catch (error) {
            console.error('\n❌ ========== ERROR EN VERIFICACIÓN ==========');
            console.error('❌ Tipo de error:', error.constructor.name);
            console.error('❌ Mensaje:', error.message);
            console.error('❌ Stack:', error.stack);
            console.error('❌ ==========================================\n');
            throw error;
        }
    }
    calcularDistanciaEuclidiana(desc1, desc2) {
        let suma = 0;
        for (let i = 0; i < desc1.length; i++) {
            const diferencia = desc1[i] - desc2[i];
            suma += diferencia * diferencia;
        }
        return Math.sqrt(suma);
    }
    async determinarTipoMarcaje(funcionarioId) {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const marcajesHoy = await this.prisma.asistencia.findMany({
            where: { funcionarioId, fecha: { gte: hoy } },
            orderBy: { fecha: 'asc' },
        });
        const tiposMarcados = marcajesHoy.map((m) => m.tipoMarcaje);
        if (!tiposMarcados.includes('INGRESO_MANANA'))
            return 'INGRESO_MANANA';
        if (!tiposMarcados.includes('SALIDA_DESCANSO'))
            return 'SALIDA_DESCANSO';
        if (!tiposMarcados.includes('INGRESO_TARDE'))
            return 'INGRESO_TARDE';
        if (!tiposMarcados.includes('SALIDA_FINAL'))
            return 'SALIDA_FINAL';
        return 'INGRESO_MANANA';
    }
    async calcularAtraso(asistenciaId) {
        const asistencia = await this.prisma.asistencia.findUnique({
            where: { id: asistenciaId },
        });
        if (!asistencia)
            return;
        const config = await this.prisma.configuracionHorario.findFirst({
            where: { tipoMarcaje: asistencia.tipoMarcaje },
        });
        if (!config)
            return;
        const horaAsistencia = new Date(asistencia.fecha);
        const [horaConfig, minConfig] = config.horaProgramada.split(':').map(Number);
        const horaProgramada = new Date(asistencia.fecha);
        horaProgramada.setHours(horaConfig, minConfig, 0, 0);
        const horaLimite = new Date(horaProgramada);
        horaLimite.setMinutes(horaLimite.getMinutes() + config.toleranciaMinutos);
        if (horaAsistencia > horaLimite) {
            const minutosTardanza = Math.floor((horaAsistencia.getTime() - horaLimite.getTime()) / (1000 * 60));
            await this.prisma.asistencia.update({
                where: { id: asistenciaId },
                data: { minutosTardanza },
            });
        }
    }
    async obtenerEstado(funcionarioId) {
        const registros = await this.prisma.registroFacial.findMany({
            where: { funcionarioId },
            orderBy: { createdAt: 'desc' },
        });
        return {
            funcionarioId,
            registrado: registros.length > 0,
            cantidadRegistros: registros.length,
            ultimoRegistro: registros[0]?.createdAt || null,
            registros: registros.map((r) => ({
                id: r.id,
                metadata: r.metadata,
                fecha: r.createdAt,
            })),
        };
    }
    async eliminarRegistros(funcionarioId) {
        const resultado = await this.prisma.registroFacial.deleteMany({
            where: { funcionarioId },
        });
        await this.prisma.funcionario.update({
            where: { id: funcionarioId },
            data: { facialDataRegistered: false },
        });
        return {
            message: 'Registros faciales eliminados',
            eliminados: resultado.count,
        };
    }
};
exports.FacialRecognitionService = FacialRecognitionService;
exports.FacialRecognitionService = FacialRecognitionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        telegram_service_1.TelegramService])
], FacialRecognitionService);
//# sourceMappingURL=facial-recognition.service.js.map