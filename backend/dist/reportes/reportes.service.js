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
            orderBy: {
                fecha: 'asc',
            },
        });
        const diasUnicos = new Set(marcajes.map(m => m.fecha.toISOString().split('T')[0])).size;
        const totalMinutosTardanza = marcajes.reduce((sum, m) => sum + m.minutosTardanza, 0);
        const totalMinutosTrabajados = diasUnicos * 480;
        const reporte = await this.prisma.resumenMensual.create({
            data: {
                funcionarioId,
                anio,
                mes,
                totalDiasTrabajados: diasUnicos,
                totalMinutosTardanza,
                totalMinutosTrabajados,
                totalAusencias: 0,
                totalPermisos: 0,
                reporteGenerado: true,
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
        return reporte;
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
        return reportes;
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
        return reporte;
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
        return reportes;
    }
    async descargarPDF(id, res) {
        const reporte = await this.findOne(id);
        const fechaInicio = new Date(reporte.anio, reporte.mes - 1, 1);
        const fechaFin = new Date(reporte.anio, reporte.mes, 0);
        const marcajes = await this.prisma.asistencia.findMany({
            where: {
                funcionarioId: reporte.funcionarioId,
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
        const datosReporte = {
            funcionario: {
                nombre: reporte.funcionario.nombre,
                apellido: reporte.funcionario.apellido,
                cargo: reporte.funcionario.cargo,
                dependencia: reporte.funcionario.dependencia,
            },
            periodo: {
                mes: pdf_generator_1.PDFGenerator.obtenerNombreMes(reporte.mes),
                anio: reporte.anio,
            },
            resumen: {
                totalDiasTrabajados: reporte.totalDiasTrabajados,
                totalMinutosTardanza: reporte.totalMinutosTardanza,
                totalMinutosTrabajados: reporte.totalMinutosTrabajados,
                totalAusencias: reporte.totalAusencias,
                totalPermisos: reporte.totalPermisos,
            },
            marcajes: marcajes.map(m => ({
                fecha: m.fecha.toISOString().split('T')[0],
                tipoMarcaje: m.tipoMarcaje,
                horaMarcaje: m.horaMarcaje.toTimeString().substring(0, 5),
                minutosTardanza: m.minutosTardanza,
            })),
        };
        await pdf_generator_1.PDFGenerator.generarReporteMensual(datosReporte, res);
    }
    async regenerarReporte(id) {
        const reporteExistente = await this.findOne(id);
        const fechaInicio = new Date(reporteExistente.anio, reporteExistente.mes - 1, 1);
        const fechaFin = new Date(reporteExistente.anio, reporteExistente.mes, 0);
        const marcajes = await this.prisma.asistencia.findMany({
            where: {
                funcionarioId: reporteExistente.funcionarioId,
                fecha: {
                    gte: fechaInicio,
                    lte: fechaFin,
                },
            },
        });
        const diasUnicos = new Set(marcajes.map(m => m.fecha.toISOString().split('T')[0])).size;
        const totalMinutosTardanza = marcajes.reduce((sum, m) => sum + m.minutosTardanza, 0);
        const totalMinutosTrabajados = diasUnicos * 480;
        const reporteActualizado = await this.prisma.resumenMensual.update({
            where: { id },
            data: {
                totalDiasTrabajados: diasUnicos,
                totalMinutosTardanza,
                totalMinutosTrabajados,
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
        return reporteActualizado;
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
};
exports.ReportesService = ReportesService;
exports.ReportesService = ReportesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportesService);
//# sourceMappingURL=reportes.service.js.map