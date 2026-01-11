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
    async determinarTipoMarcaje(horaMarcaje) {
        const configuraciones = await this.prisma.configuracionHorario.findMany();
        const horaString = horaMarcaje.toTimeString().substring(0, 5);
        for (const config of configuraciones) {
            if (!config.horaInicioVentana || !config.horaFinVentana) {
                continue;
            }
            if (horaString >= config.horaInicioVentana && horaString <= config.horaFinVentana) {
                return config.tipoMarcaje;
            }
        }
        throw new common_1.BadRequestException(`La hora ${horaString} está fuera de las ventanas de marcaje permitidas. ` +
            `Ventanas válidas: 06:30-09:00 (Ingreso Mañana), 11:00-13:00 (Salida Descanso), ` +
            `13:00-15:00 (Ingreso Tarde), 17:00-21:00 (Salida Final)`);
    }
    calcularTardanza(horaMarcaje, configuracion) {
        const horasMarcaje = horaMarcaje.getHours();
        const minutosMarcaje = horaMarcaje.getMinutes();
        const minutosTotalesMarcaje = horasMarcaje * 60 + minutosMarcaje;
        const [horasEsperadas, minutosEsperados] = configuracion.horaProgramada
            .split(':')
            .map(Number);
        const minutosTotalesEsperados = horasEsperadas * 60 + minutosEsperados;
        const diferencia = minutosTotalesMarcaje - minutosTotalesEsperados - configuracion.toleranciaMinutos;
        return diferencia > 0 ? diferencia : 0;
    }
    calcularSalidaAnticipada(horaMarcaje, configuracion) {
        const horasMarcaje = horaMarcaje.getHours();
        const minutosMarcaje = horaMarcaje.getMinutes();
        const minutosTotalesMarcaje = horasMarcaje * 60 + minutosMarcaje;
        const [horasEsperadas, minutosEsperados] = configuracion.horaProgramada
            .split(':')
            .map(Number);
        const minutosTotalesEsperados = horasEsperadas * 60 + minutosEsperados;
        const diferencia = minutosTotalesEsperados - minutosTotalesMarcaje;
        return diferencia > 0 ? diferencia : 0;
    }
    async create(createAsistenciaDto) {
        const { funcionarioId, fecha, horaMarcaje, tipoMarcaje } = createAsistenciaDto;
        console.log('📥 Recibido del frontend:', { fecha, horaMarcaje, tipoMarcaje });
        const [year, month, day] = fecha.split('-').map(Number);
        const [hour, minute] = horaMarcaje.split(':').map(Number);
        const horaMarcajeCompleta = new Date(year, month - 1, day, hour, minute, 0);
        const fechaSolo = new Date(year, month - 1, day);
        console.log('✅ Fechas parseadas:', {
            fechaSolo,
            horaMarcajeCompleta
        });
        const config = await this.prisma.configuracionHorario.findUnique({
            where: { tipoMarcaje },
        });
        if (!config) {
            throw new common_1.NotFoundException(`No existe configuración para ${tipoMarcaje}`);
        }
        const hMarcaje = horaMarcajeCompleta.getHours() * 60 + horaMarcajeCompleta.getMinutes();
        const [h, m] = config.horaProgramada.split(':').map(Number);
        const hEsperada = h * 60 + m;
        let minutosTardanza = 0;
        let minutosSalidaAnticipada = 0;
        if (tipoMarcaje === 'INGRESO_MANANA' || tipoMarcaje === 'INGRESO_TARDE') {
            const diferencia = hMarcaje - hEsperada - config.toleranciaMinutos;
            minutosTardanza = diferencia > 0 ? diferencia : 0;
        }
        else {
            const diferencia = hEsperada - hMarcaje;
            minutosSalidaAnticipada = diferencia > 0 ? diferencia : 0;
        }
        const asistencia = await this.prisma.asistencia.create({
            data: {
                funcionarioId,
                fecha: fechaSolo,
                horaMarcaje: horaMarcajeCompleta,
                tipoMarcaje,
                metodoMarcaje: 'MANUAL',
                minutosTardanza,
                minutosSalidaAnticipada,
                verificado: true,
            },
            include: {
                funcionario: true,
            },
        });
        console.log('✅ Asistencia creada:', {
            id: asistencia.id,
            fecha: asistencia.fecha,
            horaMarcaje: asistencia.horaMarcaje
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
        let horaMarcajeActualizada;
        let tipoMarcajeActualizado;
        if (updateAsistenciaDto.horaMarcaje) {
            const [horas, minutos] = updateAsistenciaDto.horaMarcaje.split(':').map(Number);
            const fechaBase = dataToUpdate.fecha || asistencia.fecha;
            horaMarcajeActualizada = new Date(fechaBase);
            horaMarcajeActualizada.setHours(horas, minutos, 0, 0);
            dataToUpdate.horaMarcaje = horaMarcajeActualizada;
            tipoMarcajeActualizado = await this.determinarTipoMarcaje(horaMarcajeActualizada);
            dataToUpdate.tipoMarcaje = tipoMarcajeActualizado;
        }
        if (updateAsistenciaDto.tipoMarcaje !== undefined) {
            dataToUpdate.tipoMarcaje = updateAsistenciaDto.tipoMarcaje;
            tipoMarcajeActualizado = updateAsistenciaDto.tipoMarcaje;
        }
        if (horaMarcajeActualizada || tipoMarcajeActualizado) {
            const horaParaCalcular = horaMarcajeActualizada || asistencia.horaMarcaje;
            const tipoParaCalcular = tipoMarcajeActualizado || asistencia.tipoMarcaje;
            const configuracion = await this.prisma.configuracionHorario.findUnique({
                where: { tipoMarcaje: tipoParaCalcular },
            });
            if (configuracion) {
                if (tipoParaCalcular === 'INGRESO_MANANA' || tipoParaCalcular === 'INGRESO_TARDE') {
                    dataToUpdate.minutosTardanza = this.calcularTardanza(horaParaCalcular, configuracion);
                    dataToUpdate.minutosSalidaAnticipada = 0;
                }
                else {
                    dataToUpdate.minutosSalidaAnticipada = this.calcularSalidaAnticipada(horaParaCalcular, configuracion);
                    dataToUpdate.minutosTardanza = 0;
                }
            }
        }
        else {
            if (updateAsistenciaDto.minutosTardanza !== undefined) {
                dataToUpdate.minutosTardanza = updateAsistenciaDto.minutosTardanza;
            }
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
        const salidasAnticipadas = await this.prisma.asistencia.aggregate({
            where: {
                ...whereClause,
                minutosSalidaAnticipada: {
                    gt: 0,
                },
            },
            _count: {
                id: true,
            },
            _sum: {
                minutosSalidaAnticipada: true,
            },
        });
        return {
            totalMarcajes,
            totalTardanzas: tardanzas._count.id,
            minutosTardanzaTotal: tardanzas._sum.minutosTardanza || 0,
            minutosTardanzaPromedio: Math.round(tardanzas._avg.minutosTardanza || 0),
            totalSalidasAnticipadas: salidasAnticipadas._count.id,
            minutosSalidaAnticipadaTotal: salidasAnticipadas._sum.minutosSalidaAnticipada || 0,
        };
    }
};
exports.AsistenciasService = AsistenciasService;
exports.AsistenciasService = AsistenciasService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AsistenciasService);
//# sourceMappingURL=asistencias.service.js.map