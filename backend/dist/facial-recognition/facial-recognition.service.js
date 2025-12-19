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
const prisma_service_1 = require("../database/prisma.service");
const faceapi = __importStar(require("face-api.js"));
const canvas = __importStar(require("canvas"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const notifications_service_1 = require("../notifications/notifications.service");
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });
let FacialRecognitionService = class FacialRecognitionService {
    prisma;
    notificationsService;
    modelsLoaded = false;
    modelsPath = path.join(process.cwd(), 'models');
    constructor(prisma, notificationsService) {
        this.prisma = prisma;
        this.notificationsService = notificationsService;
        this.loadModels();
    }
    async loadModels() {
        if (this.modelsLoaded)
            return;
        try {
            console.log('Cargando modelos de reconocimiento facial...');
            await Promise.all([
                faceapi.nets.ssdMobilenetv1.loadFromDisk(this.modelsPath),
                faceapi.nets.faceLandmark68Net.loadFromDisk(this.modelsPath),
                faceapi.nets.faceRecognitionNet.loadFromDisk(this.modelsPath),
            ]);
            this.modelsLoaded = true;
            console.log('Modelos cargados exitosamente');
        }
        catch (error) {
            console.error('Error al cargar modelos:', error);
            throw new Error('No se pudieron cargar los modelos de reconocimiento facial');
        }
    }
    async registrarDatosFaciales(funcionarioId, imagePath) {
        await this.loadModels();
        const funcionario = await this.prisma.funcionario.findUnique({
            where: { id: funcionarioId },
        });
        if (!funcionario) {
            throw new common_1.NotFoundException('Funcionario no encontrado');
        }
        const img = await canvas.loadImage(imagePath);
        const detection = await faceapi
            .detectSingleFace(img)
            .withFaceLandmarks()
            .withFaceDescriptor();
        if (!detection) {
            throw new common_1.BadRequestException('No se detectó ningún rostro en la imagen');
        }
        const descriptores = Array.from(detection.descriptor);
        const existingData = await this.prisma.facialData.findUnique({
            where: { funcionarioId },
        });
        let facialData;
        if (existingData) {
            facialData = await this.prisma.facialData.update({
                where: { funcionarioId },
                data: {
                    descriptores: descriptores,
                    fotoReferencia: imagePath,
                    activo: true,
                },
            });
        }
        else {
            facialData = await this.prisma.facialData.create({
                data: {
                    funcionarioId,
                    descriptores: descriptores,
                    fotoReferencia: imagePath,
                    activo: true,
                    confianza: 0.7,
                },
            });
        }
        await this.prisma.funcionario.update({
            where: { id: funcionarioId },
            data: {
                facialDataRegistered: true
            },
        });
        return {
            message: 'Datos faciales registrados exitosamente',
            facialData: {
                id: facialData.id,
                funcionarioId: facialData.funcionarioId,
                fotoReferencia: facialData.fotoReferencia,
                activo: facialData.activo,
            },
        };
    }
    async verificarRostro(imagePath) {
        await this.loadModels();
        const img = await canvas.loadImage(imagePath);
        const detection = await faceapi
            .detectSingleFace(img)
            .withFaceLandmarks()
            .withFaceDescriptor();
        if (!detection) {
            throw new common_1.BadRequestException('No se detectó ningún rostro en la imagen');
        }
        const queryDescriptor = detection.descriptor;
        const allFacialData = await this.prisma.facialData.findMany({
            where: { activo: true },
            include: {
                funcionario: {
                    include: {
                        usuario: true,
                    },
                },
            },
        });
        if (allFacialData.length === 0) {
            throw new common_1.NotFoundException('No hay funcionarios registrados con datos faciales');
        }
        let bestMatch = null;
        let bestDistance = 1.0;
        for (const data of allFacialData) {
            const storedDescriptor = new Float32Array(data.descriptores);
            const distance = faceapi.euclideanDistance(queryDescriptor, storedDescriptor);
            if (distance < bestDistance) {
                bestDistance = distance;
                bestMatch = {
                    funcionario: data.funcionario,
                    distance,
                    confidence: 1 - distance,
                    threshold: Number(data.confianza),
                };
            }
        }
        if (!bestMatch || bestDistance > (1 - bestMatch.threshold)) {
            return {
                success: false,
                message: 'No se encontró coincidencia con ningún funcionario',
                confidence: bestMatch ? bestMatch.confidence : 0,
            };
        }
        return {
            success: true,
            message: 'Funcionario identificado',
            funcionario: {
                id: bestMatch.funcionario.id,
                nombre: bestMatch.funcionario.nombre,
                apellido: bestMatch.funcionario.apellido,
                cargo: bestMatch.funcionario.cargo,
                dependencia: bestMatch.funcionario.dependencia,
            },
            confidence: bestMatch.confidence,
            distance: bestDistance,
        };
    }
    async registrarMarcajeFacial(imagePath, tipoMarcaje) {
        const verificacion = await this.verificarRostro(imagePath);
        if (!verificacion.success) {
            throw new common_1.BadRequestException(verificacion.message);
        }
        const funcionarioId = verificacion.funcionario.id;
        let tipo = tipoMarcaje;
        if (!tipo) {
            tipo = this.determinarTipoMarcaje();
        }
        const configuracion = await this.prisma.configuracionHorario.findFirst({
            where: { tipoMarcaje: tipo },
        });
        if (!configuracion) {
            throw new common_1.BadRequestException('No hay configuración de horario para este tipo de marcaje');
        }
        const ahora = new Date();
        const horaProgramada = new Date(configuracion.horaProgramada);
        const horaLimite = new Date(horaProgramada);
        horaLimite.setMinutes(horaLimite.getMinutes() + configuracion.toleranciaMinutos);
        let minutosTardanza = 0;
        if (ahora > horaLimite) {
            minutosTardanza = Math.floor((ahora.getTime() - horaLimite.getTime()) / (1000 * 60));
        }
        const asistencia = await this.prisma.asistencia.create({
            data: {
                funcionarioId,
                fecha: ahora,
                horaMarcaje: ahora,
                tipoMarcaje: tipo,
                minutosTardanza,
                verificado: true,
            },
        });
        const marcajeFacial = await this.prisma.marcajeFacial.create({
            data: {
                asistenciaId: asistencia.id,
                fotoEvidencia: imagePath,
                confidence: verificacion.confidence,
            },
        });
        await this.notificationsService.notificarMarcaje(asistencia.id);
        return {
            success: true,
            message: 'Marcaje registrado exitosamente',
            asistencia: {
                id: asistencia.id,
                funcionario: verificacion.funcionario,
                tipoMarcaje: asistencia.tipoMarcaje,
                horaMarcaje: asistencia.horaMarcaje,
                minutosTardanza: asistencia.minutosTardanza,
            },
            evidencia: {
                fotoEvidencia: marcajeFacial.fotoEvidencia,
                confidence: marcajeFacial.confidence,
            },
        };
    }
    determinarTipoMarcaje() {
        const ahora = new Date();
        const hora = ahora.getHours();
        const minutos = ahora.getMinutes();
        const tiempoEnMinutos = hora * 60 + minutos;
        if (tiempoEnMinutos >= 7 * 60 && tiempoEnMinutos < 10 * 60) {
            return 'INGRESO_MANANA';
        }
        else if (tiempoEnMinutos >= 11 * 60 && tiempoEnMinutos < 13 * 60) {
            return 'SALIDA_DESCANSO';
        }
        else if (tiempoEnMinutos >= 13 * 60 && tiempoEnMinutos < 16 * 60) {
            return 'INGRESO_TARDE';
        }
        else if (tiempoEnMinutos >= 16 * 60 && tiempoEnMinutos < 20 * 60) {
            return 'SALIDA_FINAL';
        }
        if (tiempoEnMinutos < 7 * 60) {
            throw new common_1.BadRequestException('Fuera de horario laboral');
        }
        else {
            return 'SALIDA_FINAL';
        }
    }
    async obtenerDatosFaciales(funcionarioId) {
        const facialData = await this.prisma.facialData.findUnique({
            where: { funcionarioId },
            include: {
                funcionario: true,
            },
        });
        if (!facialData) {
            throw new common_1.NotFoundException('No hay datos faciales para este funcionario');
        }
        return {
            id: facialData.id,
            funcionarioId: facialData.funcionarioId,
            fotoReferencia: facialData.fotoReferencia,
            activo: facialData.activo,
            confianza: facialData.confianza,
            createdAt: facialData.createdAt,
            updatedAt: facialData.updatedAt,
            funcionario: {
                nombre: facialData.funcionario.nombre,
                apellido: facialData.funcionario.apellido,
                cargo: facialData.funcionario.cargo,
            },
        };
    }
    async eliminarDatosFaciales(funcionarioId) {
        const facialData = await this.prisma.facialData.findUnique({
            where: { funcionarioId },
        });
        if (!facialData) {
            throw new common_1.NotFoundException('No hay datos faciales para este funcionario');
        }
        if (fs.existsSync(facialData.fotoReferencia)) {
            fs.unlinkSync(facialData.fotoReferencia);
        }
        await this.prisma.facialData.delete({
            where: { funcionarioId },
        });
        await this.prisma.funcionario.update({
            where: { id: funcionarioId },
            data: {
                facialDataRegistered: false
            },
        });
        return {
            message: 'Datos faciales eliminados exitosamente',
        };
    }
    async listarFuncionariosConDatosFaciales() {
        const facialData = await this.prisma.facialData.findMany({
            where: { activo: true },
            include: {
                funcionario: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return facialData.map(data => ({
            id: data.id,
            funcionarioId: data.funcionarioId,
            funcionario: {
                nombre: data.funcionario.nombre,
                apellido: data.funcionario.apellido,
                cargo: data.funcionario.cargo,
                dependencia: data.funcionario.dependencia,
            },
            fotoReferencia: data.fotoReferencia,
            confianza: data.confianza,
            createdAt: data.createdAt,
        }));
    }
};
exports.FacialRecognitionService = FacialRecognitionService;
exports.FacialRecognitionService = FacialRecognitionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService])
], FacialRecognitionService);
//# sourceMappingURL=facial-recognition.service.js.map