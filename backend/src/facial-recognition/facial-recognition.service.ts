import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import * as faceapi from 'face-api.js';
import * as canvas from 'canvas';
import * as fs from 'fs';
import * as path from 'path';
import { NotificationsService } from '../notifications/notifications.service';

// Configurar canvas para face-api
const { Canvas, Image, ImageData } = canvas;
// @ts-ignore
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

@Injectable()
export class FacialRecognitionService {
  private modelsLoaded = false;
  private readonly modelsPath = path.join(process.cwd(), 'models');

  constructor(private prisma: PrismaService,
    private notificationsService: NotificationsService,) {
    this.loadModels();
  }

  /**
   * Cargar modelos de face-api
   */
  private async loadModels() {
    if (this.modelsLoaded) return;

    try {
      console.log('Cargando modelos de reconocimiento facial...');
      
      await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromDisk(this.modelsPath),
        faceapi.nets.faceLandmark68Net.loadFromDisk(this.modelsPath),
        faceapi.nets.faceRecognitionNet.loadFromDisk(this.modelsPath),
      ]);

      this.modelsLoaded = true;
      console.log('Modelos cargados exitosamente');
    } catch (error) {
      console.error('Error al cargar modelos:', error);
      throw new Error('No se pudieron cargar los modelos de reconocimiento facial');
    }
  }

  /**
   * Registrar datos faciales de un funcionario
   */
  async registrarDatosFaciales(
    funcionarioId: number,
    imagePath: string,
  ): Promise<any> {
    await this.loadModels();

    // Verificar que el funcionario existe
    const funcionario = await this.prisma.funcionario.findUnique({
      where: { id: funcionarioId },
    });

    if (!funcionario) {
      throw new NotFoundException('Funcionario no encontrado');
    }

    // Cargar imagen
    const img = await canvas.loadImage(imagePath);
    
    // Detectar rostro y extraer descriptores
    const detection = await faceapi
      .detectSingleFace(img as any)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      throw new BadRequestException('No se detectó ningún rostro en la imagen');
    }

    // Convertir descriptor a array
    const descriptores = Array.from(detection.descriptor);

    // Verificar si ya existe registro facial
    const existingData = await this.prisma.facialData.findUnique({
      where: { funcionarioId },
    });

    let facialData;

    if (existingData) {
      // Actualizar
      facialData = await this.prisma.facialData.update({
        where: { funcionarioId },
        data: {
          descriptores: descriptores as any,
          fotoReferencia: imagePath,
          activo: true,
        },
      });
    } else {
      // Crear nuevo
      facialData = await this.prisma.facialData.create({
        data: {
          funcionarioId,
          descriptores: descriptores as any,
          fotoReferencia: imagePath,
          activo: true,
          confianza: 0.7,
        },
      });
    }

    // Actualizar flag en funcionario (usando any para evitar error de tipo)
    await (this.prisma.funcionario as any).update({
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

  /**
   * Verificar rostro y retornar funcionario
   */
  async verificarRostro(imagePath: string): Promise<any> {
    await this.loadModels();

    // Cargar imagen
    const img = await canvas.loadImage(imagePath);

    // Detectar rostro
    const detection = await faceapi
      .detectSingleFace(img as any)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      throw new BadRequestException('No se detectó ningún rostro en la imagen');
    }

    const queryDescriptor = detection.descriptor;

    // Obtener todos los datos faciales activos
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
      throw new NotFoundException('No hay funcionarios registrados con datos faciales');
    }

    // Comparar con cada funcionario
    let bestMatch: any = null;
    let bestDistance = 1.0; // Máxima distancia

    for (const data of allFacialData) {
      const storedDescriptor = new Float32Array(data.descriptores as any);
      const distance = faceapi.euclideanDistance(queryDescriptor, storedDescriptor);

      if (distance < bestDistance) {
        bestDistance = distance;
        bestMatch = {
          funcionario: data.funcionario,
          distance,
          confidence: 1 - distance, // Convertir distancia a confianza
          threshold: Number(data.confianza),
        };
      }
    }

    // Verificar si la distancia está dentro del umbral
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

  /**
   * Registrar marcaje con reconocimiento facial
   */
  async registrarMarcajeFacial(
    imagePath: string,
    tipoMarcaje?: string,
  ): Promise<any> {
    // Verificar rostro
    const verificacion = await this.verificarRostro(imagePath);

    if (!verificacion.success) {
      throw new BadRequestException(verificacion.message);
    }

    const funcionarioId = verificacion.funcionario.id;

    // Determinar tipo de marcaje si no se especificó
    let tipo = tipoMarcaje;
    if (!tipo) {
      tipo = this.determinarTipoMarcaje();
    }

    // Obtener configuración de horario
    const configuracion = await this.prisma.configuracionHorario.findFirst({
      where: { tipoMarcaje: tipo as any },
    });

    if (!configuracion) {
      throw new BadRequestException('No hay configuración de horario para este tipo de marcaje');
    }

    // Calcular tardanza
    const ahora = new Date();
    const horaProgramada = new Date(configuracion.horaProgramada);
    const horaLimite = new Date(horaProgramada);
    horaLimite.setMinutes(horaLimite.getMinutes() + configuracion.toleranciaMinutos);

    let minutosTardanza = 0;
    if (ahora > horaLimite) {
      minutosTardanza = Math.floor((ahora.getTime() - horaLimite.getTime()) / (1000 * 60));
    }

    // Registrar asistencia
    const asistencia = await this.prisma.asistencia.create({
      data: {
        funcionarioId,
        fecha: ahora,
        horaMarcaje: ahora,
        tipoMarcaje: tipo as any,
        minutosTardanza,
        verificado: true,
      },
    });

    // Registrar evidencia facial
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

  /**
   * Determinar tipo de marcaje según la hora actual
   */
  private determinarTipoMarcaje(): string {
    const ahora = new Date();
    const hora = ahora.getHours();
    const minutos = ahora.getMinutes();
    const tiempoEnMinutos = hora * 60 + minutos;

    // 7:00 - 10:00 → INGRESO_MANANA
    if (tiempoEnMinutos >= 7 * 60 && tiempoEnMinutos < 10 * 60) {
      return 'INGRESO_MANANA';
    }
    // 11:00 - 13:00 → SALIDA_DESCANSO
    else if (tiempoEnMinutos >= 11 * 60 && tiempoEnMinutos < 13 * 60) {
      return 'SALIDA_DESCANSO';
    }
    // 13:00 - 16:00 → INGRESO_TARDE
    else if (tiempoEnMinutos >= 13 * 60 && tiempoEnMinutos < 16 * 60) {
      return 'INGRESO_TARDE';
    }
    // 16:00 - 20:00 → SALIDA_FINAL
    else if (tiempoEnMinutos >= 16 * 60 && tiempoEnMinutos < 20 * 60) {
      return 'SALIDA_FINAL';
    }
    
    // Por defecto, usar el último tipo que debería haberse registrado
    if (tiempoEnMinutos < 7 * 60) {
      throw new BadRequestException('Fuera de horario laboral');
    } else {
      return 'SALIDA_FINAL';
    }
  }

  /**
   * Obtener datos faciales de un funcionario
   */
  async obtenerDatosFaciales(funcionarioId: number) {
    const facialData = await this.prisma.facialData.findUnique({
      where: { funcionarioId },
      include: {
        funcionario: true,
      },
    });

    if (!facialData) {
      throw new NotFoundException('No hay datos faciales para este funcionario');
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

  /**
   * Eliminar datos faciales
   */
  async eliminarDatosFaciales(funcionarioId: number) {
    const facialData = await this.prisma.facialData.findUnique({
      where: { funcionarioId },
    });

    if (!facialData) {
      throw new NotFoundException('No hay datos faciales para este funcionario');
    }

    // Eliminar foto de referencia
    if (fs.existsSync(facialData.fotoReferencia)) {
      fs.unlinkSync(facialData.fotoReferencia);
    }

    // Eliminar registro
    await this.prisma.facialData.delete({
      where: { funcionarioId },
    });

    // Actualizar flag en funcionario (usando any para evitar error de tipo)
    await (this.prisma.funcionario as any).update({
      where: { id: funcionarioId },
      data: { 
        facialDataRegistered: false 
      },
    });

    return {
      message: 'Datos faciales eliminados exitosamente',
    };
  }

  /**
   * Listar todos los funcionarios con datos faciales
   */
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
}