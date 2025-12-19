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
exports.AsistenciasService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
let AsistenciasService = class AsistenciasService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createAsistenciaDto) {
        const { funcionarioId, fecha, horaMarcaje, tipoMarcaje, minutosTardanza, verificado, observacion } = createAsistenciaDto;
        const funcionario = await this.prisma.funcionario.findUnique({
            where: { id: funcionarioId },
        });
        if (!funcionario) {
            throw new common_1.NotFoundException(`Funcionario con ID ${funcionarioId} no encontrado`);
        }
        const fechaDate = new Date(fecha);
        const existingMarcaje = await this.prisma.asistencia.findFirst({
            where: {
                funcionarioId,
                fecha: fechaDate,
                tipoMarcaje,
            },
        });
        if (existingMarcaje) {
            throw new common_1.BadRequestException(`Ya existe un marcaje de tipo ${tipoMarcaje} para el funcionario ${funcionario.nombre} ${funcionario.apellido} en la fecha ${fecha}`);
        }
        const [horas, minutos] = horaMarcaje.split(':').map(Number);
        const horaMarcajeCompleta = new Date(fechaDate);
        horaMarcajeCompleta.setHours(horas, minutos, 0, 0);
        const asistencia = await this.prisma.asistencia.create({
            data: {
                funcionarioId,
                fecha: fechaDate,
                horaMarcaje: horaMarcajeCompleta,
                tipoMarcaje,
                minutosTardanza: minutosTardanza || 0,
                verificado: verificado !== undefined ? verificado : true,
                observacion: observacion || null,
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
        return asistencia;
    }
    async findAll(limit, offset) {
        const asistencias = await this.prisma.asistencia.findMany({
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
                { fecha: 'desc' },
                { horaMarcaje: 'desc' },
            ],
            take: limit,
            skip: offset,
        });
        return asistencias;
    }
    async findOne(id) {
        const asistencia = await this.prisma.asistencia.findUnique({
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
        if (!asistencia) {
            throw new common_1.NotFoundException(`Asistencia con ID ${id} no encontrada`);
        }
        return asistencia;
    }
    async findByFuncionario(funcionarioId, mes, anio) {
        const funcionario = await this.prisma.funcionario.findUnique({
            where: { id: funcionarioId },
        });
        if (!funcionario) {
            throw new common_1.NotFoundException(`Funcionario con ID ${funcionarioId} no encontrado`);
        }
        const whereClause = {
            funcionarioId,
        };
        if (mes && anio) {
            const fechaInicio = new Date(anio, mes - 1, 1);
            const fechaFin = new Date(anio, mes, 0);
            whereClause.fecha = {
                gte: fechaInicio,
                lte: fechaFin,
            };
        }
        const asistencias = await this.prisma.asistencia.findMany({
            where: whereClause,
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
                { fecha: 'desc' },
                { horaMarcaje: 'desc' },
            ],
        });
        return asistencias;
    }
    async findToday() {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const manana = new Date(hoy);
        manana.setDate(manana.getDate() + 1);
        const asistencias = await this.prisma.asistencia.findMany({
            where: {
                fecha: {
                    gte: hoy,
                    lt: manana,
                },
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
            orderBy: [
                { horaMarcaje: 'desc' },
            ],
        });
        return asistencias;
    }
    async findByDate(fecha) {
        const fechaDate = new Date(fecha);
        const siguienteDia = new Date(fechaDate);
        siguienteDia.setDate(siguienteDia.getDate() + 1);
        const asistencias = await this.prisma.asistencia.findMany({
            where: {
                fecha: {
                    gte: fechaDate,
                    lt: siguienteDia,
                },
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
            orderBy: [
                { funcionario: { apellido: 'asc' } },
                { horaMarcaje: 'asc' },
            ],
        });
        return asistencias;
    }
    async findByMonth(mes, anio) {
        if (mes < 1 || mes > 12) {
            throw new common_1.BadRequestException('El mes debe estar entre 1 y 12');
        }
        const fechaInicio = new Date(anio, mes - 1, 1);
        const fechaFin = new Date(anio, mes, 0);
        const asistencias = await this.prisma.asistencia.findMany({
            where: {
                fecha: {
                    gte: fechaInicio,
                    lte: fechaFin,
                },
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
            orderBy: [
                { fecha: 'desc' },
                { funcionario: { apellido: 'asc' } },
            ],
        });
        return asistencias;
    }
    async update(id, updateAsistenciaDto) {
        const asistencia = await this.prisma.asistencia.findUnique({
            where: { id },
        });
        if (!asistencia) {
            throw new common_1.NotFoundException(`Asistencia con ID ${id} no encontrada`);
        }
        const dataToUpdate = {};
        if (updateAsistenciaDto.fecha) {
            dataToUpdate.fecha = new Date(updateAsistenciaDto.fecha);
        }
        if (updateAsistenciaDto.horaMarcaje) {
            const [horas, minutos] = updateAsistenciaDto.horaMarcaje.split(':').map(Number);
            const horaMarcajeCompleta = new Date(asistencia.fecha);
            horaMarcajeCompleta.setHours(horas, minutos, 0, 0);
            dataToUpdate.horaMarcaje = horaMarcajeCompleta;
        }
        if (updateAsistenciaDto.tipoMarcaje !== undefined) {
            dataToUpdate.tipoMarcaje = updateAsistenciaDto.tipoMarcaje;
        }
        if (updateAsistenciaDto.minutosTardanza !== undefined) {
            dataToUpdate.minutosTardanza = updateAsistenciaDto.minutosTardanza;
        }
        if (updateAsistenciaDto.verificado !== undefined) {
            dataToUpdate.verificado = updateAsistenciaDto.verificado;
        }
        if (updateAsistenciaDto.observacion !== undefined) {
            dataToUpdate.observacion = updateAsistenciaDto.observacion;
        }
        const asistenciaActualizada = await this.prisma.asistencia.update({
            where: { id },
            data: dataToUpdate,
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
        return asistenciaActualizada;
    }
    async remove(id) {
        const asistencia = await this.prisma.asistencia.findUnique({
            where: { id },
        });
        if (!asistencia) {
            throw new common_1.NotFoundException(`Asistencia con ID ${id} no encontrada`);
        }
        await this.prisma.asistencia.delete({
            where: { id },
        });
        return {
            message: `Marcaje del ${asistencia.fecha.toISOString().split('T')[0]} eliminado exitosamente`
        };
    }
    async getEstadisticas(mes, anio) {
        const whereClause = {};
        if (mes && anio) {
            const fechaInicio = new Date(anio, mes - 1, 1);
            const fechaFin = new Date(anio, mes, 0);
            whereClause.fecha = {
                gte: fechaInicio,
                lte: fechaFin,
            };
        }
        const totalMarcajes = await this.prisma.asistencia.count({
            where: whereClause,
        });
        const tardanzas = await this.prisma.asistencia.aggregate({
            where: {
                ...whereClause,
                minutosTardanza: {
                    gt: 0,
                },
            },
            _count: {
                id: true,
            },
            _sum: {
                minutosTardanza: true,
            },
            _avg: {
                minutosTardanza: true,
            },
        });
        return {
            totalMarcajes,
            totalTardanzas: tardanzas._count.id,
            minutosTardanzaTotal: tardanzas._sum.minutosTardanza || 0,
            minutosTardanzaPromedio: Math.round(tardanzas._avg.minutosTardanza || 0),
        };
    }
};
exports.AsistenciasService = AsistenciasService;
exports.AsistenciasService = AsistenciasService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AsistenciasService);
//# sourceMappingURL=asistencias.service.js.map