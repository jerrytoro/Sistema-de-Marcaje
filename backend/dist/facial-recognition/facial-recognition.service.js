"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FacialRecognitionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
require("@tensorflow/tfjs-backend-cpu");
const tf = __importStar(require("@tensorflow/tfjs"));
tf.setBackend('cpu');
const faceapi = __importStar(require("face-api.js"));
const canvas = __importStar(require("canvas"));
const path = __importStar(require("path"));
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });
let FacialRecognitionService = class FacialRecognitionService {
    prisma;
    modelsLoaded = false;
    constructor(prisma) {
        this.prisma = prisma;
        this.inicializar();
    }
    async inicializar() {
        try {
            await tf.ready();
            console.log('✅ TensorFlow backend:', tf.getBackend());
            await this.cargarModelos();
        }
        catch (error) {
            console.error('❌ Error en inicialización:', error);
        }
    }
    async cargarModelos() {
        if (this.modelsLoaded)
            return;
        try {
            const MODEL_URL = path.join(process.cwd(), 'models');
            console.log('📂 Intentando cargar modelos desde:', MODEL_URL);
            await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODEL_URL);
            console.log('✅ ssdMobilenetv1 cargado');
            await faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_URL);
            console.log('✅ faceLandmark68Net cargado');
            await faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_URL);
            console.log('✅ faceRecognitionNet cargado');
            this.modelsLoaded = true;
            console.log('✅ Todos los modelos cargados correctamente');
        }
        catch (error) {
            console.error('❌ Error detallado al cargar modelos:', error);
            throw new Error('No se pudieron cargar los modelos de reconocimiento facial');
        }
    }
    async detectarRostro(buffer) {
        try {
            const img = await canvas.loadImage(buffer);
            const detecciones = await faceapi
                .detectSingleFace(img)
                .withFaceLandmarks()
                .withFaceDescriptor();
            if (!detecciones) {
                return null;
            }
            return detecciones.descriptor;
        }
        catch (error) {
            console.error('Error al detectar rostro:', error);
            return null;
        }
    }
    async registrarDatosFaciales(funcionarioId, foto) {
        if (!foto) {
            throw new common_1.BadRequestException('No se proporcionó ninguna foto');
        }
        const funcionario = await this.prisma.funcionario.findUnique({
            where: { id: funcionarioId },
        });
        if (!funcionario) {
            throw new common_1.BadRequestException('Funcionario no encontrado');
        }
        const descriptor = await this.detectarRostro(foto.buffer);
        if (!descriptor) {
            throw new common_1.BadRequestException('No se detectó ningún rostro en la imagen');
        }
        await this.prisma.registroFacial.create({
            data: {
                funcionarioId,
                facialData: JSON.stringify(Array.from(descriptor)),
                metadata: {
                    capturaNumero: 1,
                    fechaCaptura: new Date().toISOString(),
                    metodo: 'registro-simple',
                },
            },
        });
        await this.prisma.funcionario.update({
            where: { id: funcionarioId },
            data: { facialDataRegistered: true },
        });
        return {
            message: 'Registro facial completado exitosamente',
            funcionarioId,
            registros: 1,
        };
    }
    async registrarMultiple(funcionarioId, fotos, metadata) {
        console.log('🔍 ========== INICIO REGISTRO MÚLTIPLE ==========');
        console.log('📝 Funcionario ID:', funcionarioId);
        console.log('📝 Cantidad de fotos recibidas:', fotos?.length);
        console.log('📝 Metadata recibida:', metadata);
        try {
            if (!fotos || fotos.length !== 5) {
                const error = `Se requieren exactamente 5 fotos, se recibieron ${fotos?.length || 0}`;
                console.error('❌ ERROR DE VALIDACIÓN:', error);
                throw new common_1.BadRequestException(error);
            }
            console.log('✅ Validación de cantidad de fotos: OK');
            const funcionario = await this.prisma.funcionario.findUnique({
                where: { id: funcionarioId },
            });
            console.log('📝 Funcionario encontrado:', funcionario ? 'SI' : 'NO');
            if (!funcionario) {
                console.error('❌ ERROR: Funcionario no encontrado con ID:', funcionarioId);
                throw new common_1.BadRequestException('Funcionario no encontrado');
            }
            console.log('✅ Funcionario encontrado:', funcionario.nombre, funcionario.apellido);
            console.log('🗑️ Eliminando registros anteriores...');
            await this.prisma.registroFacial.deleteMany({
                where: { funcionarioId },
            });
            console.log('✅ Registros anteriores eliminados');
            const registrosCreados = [];
            for (let i = 0; i < fotos.length; i++) {
                const foto = fotos[i];
                const instruccion = metadata[`instruccion${i + 1}`] || `Foto ${i + 1}`;
                console.log(`\n📸 Procesando foto ${i + 1}/5`);
                console.log('  - Instrucción:', instruccion);
                console.log('  - Tamaño:', foto.size, 'bytes');
                console.log('  - Tipo:', foto.mimetype);
                console.log('  - Detectando rostro...');
                const descriptor = await this.detectarRostro(foto.buffer);
                if (!descriptor) {
                    const errorMsg = `No se detectó rostro en la foto ${i + 1} (${instruccion})`;
                    console.error(`  ❌ ${errorMsg}`);
                    throw new common_1.BadRequestException(errorMsg);
                }
                console.log('  ✅ Rostro detectado, descriptor generado');
                console.log('  - Longitud del descriptor:', descriptor.length);
                console.log('  - Guardando en BD...');
                const registro = await this.prisma.registroFacial.create({
                    data: {
                        funcionarioId,
                        facialData: JSON.stringify(Array.from(descriptor)),
                        metadata: {
                            instruccion,
                            capturaNumero: i + 1,
                            fechaCaptura: new Date().toISOString(),
                            metodo: 'registro-multiple',
                        },
                    },
                });
                console.log('  ✅ Registro guardado en BD con ID:', registro.id);
                registrosCreados.push(registro);
            }
            console.log('\n📝 Actualizando flag facialDataRegistered...');
            await this.prisma.funcionario.update({
                where: { id: funcionarioId },
                data: { facialDataRegistered: true },
            });
            console.log('✅ ========== REGISTRO MÚLTIPLE COMPLETADO ==========\n');
            return {
                message: 'Registro facial múltiple completado exitosamente',
                funcionarioId,
                registrosCreados: registrosCreados.length,
                detalles: registrosCreados.map((r, i) => ({
                    id: r.id,
                    instruccion: metadata[`instruccion${i + 1}`],
                })),
            };
        }
        catch (error) {
            console.error('\n❌ ========== ERROR EN REGISTRO MÚLTIPLE ==========');
            console.error('❌ Tipo de error:', error.constructor.name);
            console.error('❌ Mensaje:', error.message);
            console.error('❌ Stack:', error.stack);
            console.error('❌ ================================================\n');
            throw error;
        }
    }
    async verificarYMarcar(foto) {
        if (!foto) {
            return {
                success: false,
                message: 'No se proporcionó ninguna foto',
            };
        }
        const descriptorEntrada = await this.detectarRostro(foto.buffer);
        if (!descriptorEntrada) {
            return {
                success: false,
                message: 'No se detectó ningún rostro en la imagen',
            };
        }
        const todosLosRegistros = await this.prisma.registroFacial.findMany({
            include: {
                funcionario: {
                    include: {
                        usuario: true,
                    },
                },
            },
        });
        if (todosLosRegistros.length === 0) {
            return {
                success: false,
                message: 'No hay funcionarios registrados con datos faciales',
            };
        }
        let mejorCoincidencia = null;
        let mejorDistancia = Infinity;
        const UMBRAL = 0.6;
        for (const registro of todosLosRegistros) {
            try {
                const descriptorGuardado = new Float32Array(JSON.parse(registro.facialData));
                const distancia = faceapi.euclideanDistance(descriptorEntrada, descriptorGuardado);
                if (distancia < mejorDistancia) {
                    mejorDistancia = distancia;
                    mejorCoincidencia = registro;
                }
            }
            catch (error) {
                console.error(`Error al comparar con registro ${registro.id}:`, error);
            }
        }
        if (!mejorCoincidencia || mejorDistancia > UMBRAL) {
            return {
                success: false,
                message: 'Rostro no reconocido',
                distancia: mejorDistancia,
                umbral: UMBRAL,
            };
        }
        const confianza = Math.round((1 - mejorDistancia) * 100);
        const funcionario = mejorCoincidencia.funcionario;
        const tipoMarcaje = await this.determinarTipoMarcaje(funcionario.id);
        const asistencia = await this.prisma.asistencia.create({
            data: {
                funcionarioId: funcionario.id,
                fecha: new Date(),
                tipoMarcaje: tipoMarcaje,
                metodoMarcaje: 'FACIAL',
            },
        });
        await this.calcularAtraso(asistencia.id);
        return {
            success: true,
            message: `Bienvenido ${funcionario.nombre} ${funcionario.apellido}`,
            asistencia: {
                id: asistencia.id,
                tipo: tipoMarcaje,
                hora: asistencia.fecha,
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
    async determinarTipoMarcaje(funcionarioId) {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const marcajesHoy = await this.prisma.asistencia.findMany({
            where: {
                funcionarioId,
                fecha: {
                    gte: hoy,
                },
            },
            orderBy: {
                fecha: 'asc',
            },
        });
        const tiposMarcados = marcajesHoy.map((m) => m.tipoMarcaje);
        if (!tiposMarcados.includes('INGRESO_MANANA')) {
            return 'INGRESO_MANANA';
        }
        if (!tiposMarcados.includes('SALIDA_DESCANSO')) {
            return 'SALIDA_DESCANSO';
        }
        if (!tiposMarcados.includes('INGRESO_TARDE')) {
            return 'INGRESO_TARDE';
        }
        if (!tiposMarcados.includes('SALIDA_FINAL')) {
            return 'SALIDA_FINAL';
        }
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
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FacialRecognitionService);
//# sourceMappingURL=facial-recognition.service.js.map