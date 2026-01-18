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
exports.ReportesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const pdf_generator_1 = require("./utils/pdf-generator");
let ReportesService = class ReportesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    agruparMarcajesPorDia(marcajes) {
        const diasMap = new Map();
        marcajes.forEach(marcaje => {
            const fecha = marcaje.fecha.toISOString().split('T')[0];
            if (!diasMap.has(fecha)) {
                diasMap.set(fecha, []);
            }
            diasMap.get(fecha).push(marcaje);
        });
        const diasTrabajados = [];
        diasMap.forEach((marcajesDia, fecha) => {
            const dia = {
                fecha: this.formatearFecha(fecha),
                totalTardanza: 0,
                totalSalidaAnticipada: 0,
                permisos: 0,
                jornada: 0
            };
            let minutosTrabajados = 0;
            let horaIngresoManana = null;
            let horaSalidaFinal = null;
            marcajesDia.forEach(marcaje => {
                const hora = marcaje.horaMarcaje.toTimeString().substring(0, 5);
                const tardanza = marcaje.minutosTardanza || 0;
                const salidaAnticipada = marcaje.minutosSalidaAnticipada || 0;
                switch (marcaje.tipoMarcaje) {
                    case 'INGRESO_MANANA':
                        dia.ingresoManana = { hora, tardanza };
                        dia.totalTardanza += tardanza;
                        horaIngresoManana = marcaje.horaMarcaje;
                        break;
                    case 'SALIDA_DESCANSO':
                        dia.salidaDescanso = { hora, anticipada: salidaAnticipada };
                        dia.totalSalidaAnticipada += salidaAnticipada;
                        if (horaIngresoManana) {
                            const diffMs = marcaje.horaMarcaje.getTime() - horaIngresoManana.getTime();
                            minutosTrabajados += Math.floor(diffMs / 60000);
                        }
                        break;
                    case 'INGRESO_TARDE':
                        dia.ingresoTarde = { hora, tardanza };
                        dia.totalTardanza += tardanza;
                        horaIngresoManana = marcaje.horaMarcaje;
                        break;
                    case 'SALIDA_FINAL':
                        dia.salidaFinal = { hora, anticipada: salidaAnticipada };
                        dia.totalSalidaAnticipada += salidaAnticipada;
                        horaSalidaFinal = marcaje.horaMarcaje;
                        if (horaIngresoManana) {
                            const diffMs = marcaje.horaMarcaje.getTime() - horaIngresoManana.getTime();
                            minutosTrabajados += Math.floor(diffMs / 60000);
                        }
                        break;
                }
            });
            dia.jornada = minutosTrabajados;
            diasTrabajados.push(dia);
        });
        return diasTrabajados.sort((a, b) => a.fecha.localeCompare(b.fecha));
    }
    formatearFecha(fecha) {
        const [anio, mes, dia] = fecha.split('-');
        return `${dia}/${mes}`;
    }
    obtenerRangoPeriodo(anio, mes, marcajes) {
        if (marcajes.length === 0) {
            return { inicio: '01/01', fin: '01/01' };
        }
        const fechas = marcajes.map(m => m.fecha.toISOString().split('T')[0]);
        const fechaMin = fechas[0];
        const fechaMax = fechas[fechas.length - 1];
        return {
            inicio: this.formatearFecha(fechaMin),
            fin: this.formatearFecha(fechaMax)
        };
    }
    async generarReporte(generarReporteDto) {
        const { funcionarioId, anio, mes } = generarReporteDto;
        const funcionario = await this.prisma.funcionario.findUnique({
            where: { id: funcionarioId },
        });
        if (!funcionario) {
            throw new common_1.NotFoundException(`Funcionario con ID ${funcionarioId} no encontrado`);
        }
        const reporteExistente = await this.prisma.resumenMensual.findUnique({
            where: {
                unique_resumen_mensual: {
                    funcionarioId,
                    anio,
                    mes,
                },
            },
        });
        if (reporteExistente) {
            throw new common_1.BadRequestException(`Ya existe un reporte para ${funcionario.nombre} ${funcionario.apellido} del mes ${mes}/${anio}`);
        }
        const fechaInicio = new Date(anio, mes - 1, 1);
        const fechaFin = new Date(anio, mes, 0);
        const marcajes = await this.prisma.asistencia.findMany({
            where: {
                funcionarioId,
                fecha: {
                    gte: fechaInicio,
                    lte: fechaFin,
                },
            },
            orderBy: [
                { fecha: 'asc' },
                { horaMarcaje: 'asc' },
            ],
        });
        const diasUnicos = new Set(marcajes.map(m => m.fecha.toISOString().split('T')[0])).size;
        const totalMinutosTardanza = marcajes.reduce((sum, m) => sum + (m.minutosTardanza || 0), 0);
        const totalMinutosSalidaAnticipada = marcajes.reduce((sum, m) => sum + (m.minutosSalidaAnticipada || 0), 0);
        const diasTrabajados = this.agruparMarcajesPorDia(marcajes);
        const totalMinutosTrabajados = diasTrabajados.reduce((sum, dia) => sum + dia.jornada, 0);
        const reporte = await this.prisma.resumenMensual.create({
            data: {
                funcionarioId,
                anio,
                mes,
                totalDiasTrabajados: diasUnicos,
                totalMinutosTardanza,
                totalMinutosTrabajados,
                totalMinutosSalidaAnticipada,
                totalAusencias: 0,
                totalPermisos: 0,
                reporteGenerado: true,
                fechaGeneracion: new Date(),
                urlReportePdf: null,
            },
            include: {
                funcionario: {
                    select: {
                        id: true,
                        nombre: true,
                        apellido: true,
                        cargo: true,
                        dependencia: true,
                    },
                },
            },
        });
        return {
            ...reporte,
            fechaGeneracion: reporte.fechaGeneracion?.toISOString() || new Date().toISOString(),
        };
    }
    async findAll() {
        const reportes = await this.prisma.resumenMensual.findMany({
            include: {
                funcionario: {
                    select: {
                        id: true,
                        nombre: true,
                        apellido: true,
                        cargo: true,
                        dependencia: true,
                    },
                },
            },
            orderBy: [
                { anio: 'desc' },
                { mes: 'desc' },
            ],
        });
        return reportes.map(reporte => ({
            ...reporte,
            fechaGeneracion: reporte.fechaGeneracion?.toISOString() || new Date().toISOString(),
        }));
    }
    async findOne(id) {
        const reporte = await this.prisma.resumenMensual.findUnique({
            where: { id },
            include: {
                funcionario: {
                    select: {
                        id: true,
                        nombre: true,
                        apellido: true,
                        cargo: true,
                        dependencia: true,
                    },
                },
            },
        });
        if (!reporte) {
            throw new common_1.NotFoundException(`Reporte con ID ${id} no encontrado`);
        }
        return {
            ...reporte,
            fechaGeneracion: reporte.fechaGeneracion?.toISOString() || new Date().toISOString(),
        };
    }
    async findByFuncionario(funcionarioId) {
        const funcionario = await this.prisma.funcionario.findUnique({
            where: { id: funcionarioId },
        });
        if (!funcionario) {
            throw new common_1.NotFoundException(`Funcionario con ID ${funcionarioId} no encontrado`);
        }
        const reportes = await this.prisma.resumenMensual.findMany({
            where: { funcionarioId },
            include: {
                funcionario: {
                    select: {
                        id: true,
                        nombre: true,
                        apellido: true,
                        cargo: true,
                        dependencia: true,
                    },
                },
            },
            orderBy: [
                { anio: 'desc' },
                { mes: 'desc' },
            ],
        });
        return reportes.map(reporte => ({
            ...reporte,
            fechaGeneracion: reporte.fechaGeneracion?.toISOString() || new Date().toISOString(),
        }));
    }
    async descargarPDF(id, res) {
        const reporte = await this.findOne(id);
        const fechaInicio = new Date(reporte.anio, reporte.mes - 1, 1);
        const fechaFin = new Date(reporte.anio, reporte.mes, 0);
        const marcajes = await this.prisma.asistencia.findMany({
            where: {
                funcionarioId: reporte.funcionario.id,
                fecha: {
                    gte: fechaInicio,
                    lte: fechaFin,
                },
            },
            orderBy: [
                { fecha: 'asc' },
                { horaMarcaje: 'asc' },
            ],
        });
        const configuracionHorarios = await this.prisma.configuracionHorario.findMany({
            orderBy: { tipoMarcaje: 'asc' }
        });
        const horariosMap = configuracionHorarios.reduce((acc, config) => {
            acc[config.tipoMarcaje] = config;
            return acc;
        }, {});
        const horarios = {
            ingresoManana: horariosMap['INGRESO_MANANA']?.horaProgramada || '08:00',
            salidaDescanso: horariosMap['SALIDA_DESCANSO']?.horaProgramada || '12:00',
            ingresoTarde: horariosMap['INGRESO_TARDE']?.horaProgramada || '14:00',
            salidaFinal: horariosMap['SALIDA_FINAL']?.horaProgramada || '18:00',
            toleranciaIngresoManana: horariosMap['INGRESO_MANANA']?.toleranciaMinutos || 0,
            toleranciaIngresoTarde: horariosMap['INGRESO_TARDE']?.toleranciaMinutos || 0
        };
        const datosProcessados = pdf_generator_1.PDFGenerator.procesarMarcajesConLogicaCorrecta(marcajes, horarios);
        const rangoPeriodo = this.obtenerRangoPeriodo(reporte.anio, reporte.mes, marcajes);
        await pdf_generator_1.PDFGenerator.generarPDFDesdeReporte({
            nombre: reporte.funcionario.nombre,
            apellido: reporte.funcionario.apellido,
            cargo: reporte.funcionario.cargo,
            dependencia: reporte.funcionario.dependencia,
        }, {
            mes: this.obtenerNombreMes(reporte.mes),
            anio: reporte.anio,
            fechaInicio: rangoPeriodo.inicio,
            fechaFin: rangoPeriodo.fin,
        }, {
            totalDiasTrabajados: datosProcessados.diasUnicos,
            totalMinutosTardanza: datosProcessados.totalTardanza,
            totalMinutosTrabajados: datosProcessados.totalJornada,
            totalSalidaAnticipada: datosProcessados.totalSalidaAnticipada,
        }, datosProcessados.diasTrabajados, res);
    }
    async regenerarReporte(id) {
        const reporteExistente = await this.findOne(id);
        const fechaInicio = new Date(reporteExistente.anio, reporteExistente.mes - 1, 1);
        const fechaFin = new Date(reporteExistente.anio, reporteExistente.mes, 0);
        const marcajes = await this.prisma.asistencia.findMany({
            where: {
                funcionarioId: reporteExistente.funcionario.id,
                fecha: {
                    gte: fechaInicio,
                    lte: fechaFin,
                },
            },
            orderBy: [
                { fecha: 'asc' },
                { horaMarcaje: 'asc' },
            ],
        });
        const diasUnicos = new Set(marcajes.map(m => m.fecha.toISOString().split('T')[0])).size;
        const totalMinutosTardanza = marcajes.reduce((sum, m) => sum + (m.minutosTardanza || 0), 0);
        const totalMinutosSalidaAnticipada = marcajes.reduce((sum, m) => sum + (m.minutosSalidaAnticipada || 0), 0);
        const diasTrabajados = this.agruparMarcajesPorDia(marcajes);
        const totalMinutosTrabajados = diasTrabajados.reduce((sum, dia) => sum + dia.jornada, 0);
        const reporteActualizado = await this.prisma.resumenMensual.update({
            where: { id },
            data: {
                totalDiasTrabajados: diasUnicos,
                totalMinutosTardanza,
                totalMinutosTrabajados,
                totalMinutosSalidaAnticipada,
                fechaGeneracion: new Date(),
            },
            include: {
                funcionario: {
                    select: {
                        id: true,
                        nombre: true,
                        apellido: true,
                        cargo: true,
                        dependencia: true,
                    },
                },
            },
        });
        return {
            ...reporteActualizado,
            fechaGeneracion: reporteActualizado.fechaGeneracion?.toISOString() || new Date().toISOString(),
        };
    }
    async remove(id) {
        const reporte = await this.findOne(id);
        await this.prisma.resumenMensual.delete({
            where: { id },
        });
        return {
            message: `Reporte del mes ${reporte.mes}/${reporte.anio} eliminado exitosamente`,
        };
    }
    obtenerNombreMes(mes) {
        const meses = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
        ];
        return meses[mes - 1] || 'Desconocido';
    }
};
exports.ReportesService = ReportesService;
exports.ReportesService = ReportesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportesService);
//# sourceMappingURL=reportes.service.js.map