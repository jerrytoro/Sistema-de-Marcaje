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
exports.ConfiguracionHorariosService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
let ConfiguracionHorariosService = class ConfiguracionHorariosService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        const horarios = await this.prisma.configuracionHorario.findMany({
            orderBy: {
                tipoMarcaje: 'asc',
            },
        });
        return horarios;
    }
    async findOne(tipoMarcaje) {
        const horario = await this.prisma.configuracionHorario.findUnique({
            where: { tipoMarcaje },
        });
        if (!horario) {
            throw new common_1.NotFoundException(`Configuración de horario para ${tipoMarcaje} no encontrada`);
        }
        return horario;
    }
    async update(tipoMarcaje, updateHorarioDto) {
        await this.findOne(tipoMarcaje);
        const horarioActualizado = await this.prisma.configuracionHorario.update({
            where: { tipoMarcaje },
            data: updateHorarioDto,
        });
        return horarioActualizado;
    }
    async updateAll(updateAllHorariosDto) {
        const updates = [];
        for (const [tipoMarcaje, data] of Object.entries(updateAllHorariosDto)) {
            if (data && Object.keys(data).length > 0) {
                const update = this.prisma.configuracionHorario.update({
                    where: { tipoMarcaje: tipoMarcaje },
                    data: data,
                });
                updates.push(update);
            }
        }
        const resultados = await this.prisma.$transaction(updates);
        return {
            message: `${resultados.length} horarios actualizados exitosamente`,
            horarios: resultados,
        };
    }
    async reset() {
        const horariosDefault = [
            {
                tipoMarcaje: 'INGRESO_MANANA',
                horaProgramada: '08:00',
                toleranciaMinutos: 0,
            },
            {
                tipoMarcaje: 'SALIDA_DESCANSO',
                horaProgramada: '12:00',
                toleranciaMinutos: 0,
            },
            {
                tipoMarcaje: 'INGRESO_TARDE',
                horaProgramada: '14:00',
                toleranciaMinutos: 0,
            },
            {
                tipoMarcaje: 'SALIDA_FINAL',
                horaProgramada: '18:00',
                toleranciaMinutos: 0,
            },
        ];
        const updates = horariosDefault.map((horario) => this.prisma.configuracionHorario.update({
            where: { tipoMarcaje: horario.tipoMarcaje },
            data: {
                horaProgramada: horario.horaProgramada,
                toleranciaMinutos: horario.toleranciaMinutos,
            },
        }));
        const resultados = await this.prisma.$transaction(updates);
        return {
            message: 'Horarios restablecidos a valores por defecto',
            horarios: resultados,
        };
    }
    async verificarConflictos(tipoMarcaje, horaProgramada) {
        const todosLosHorarios = await this.findAll();
        const [horas, minutos] = horaProgramada.split(':').map(Number);
        const minutosNuevo = horas * 60 + minutos;
        const conflictos = [];
        for (const horario of todosLosHorarios) {
            if (horario.tipoMarcaje === tipoMarcaje)
                continue;
            const [h, m] = horario.horaProgramada.split(':').map(Number);
            const minutosExistente = h * 60 + m;
            const diferencia = Math.abs(minutosNuevo - minutosExistente);
            if (diferencia < 30) {
                conflictos.push({
                    tipoMarcaje: horario.tipoMarcaje,
                    horaProgramada: horario.horaProgramada,
                    diferencia: `${diferencia} minutos`,
                });
            }
        }
        return conflictos;
    }
    async getSiguienteMarcaje() {
        const ahora = new Date();
        const horaActual = `${ahora.getHours().toString().padStart(2, '0')}:${ahora.getMinutes().toString().padStart(2, '0')}`;
        const horarios = await this.findAll();
        if (horarios.length === 0) {
            return {
                mensaje: 'No hay horarios configurados',
            };
        }
        console.log('Hora actual:', horaActual);
        for (const horario of horarios) {
            if (horario.horaInicioVentana && horario.horaFinVentana) {
                if (horaActual >= horario.horaInicioVentana && horaActual <= horario.horaFinVentana) {
                    console.log('Dentro de ventana:', horario.tipoMarcaje);
                    const [hFin, mFin] = horario.horaFinVentana.split(':').map(Number);
                    const [hActual, mActual] = horaActual.split(':').map(Number);
                    const minutosRestantes = (hFin * 60 + mFin) - (hActual * 60 + mActual);
                    return {
                        tipoMarcaje: horario.tipoMarcaje,
                        horaProgramada: horario.horaProgramada,
                        horaInicioVentana: horario.horaInicioVentana,
                        horaFinVentana: horario.horaFinVentana,
                        toleranciaMinutos: horario.toleranciaMinutos,
                        minutosRestantes: minutosRestantes,
                        mensaje: `Ventana activa hasta ${horario.horaFinVentana}`,
                    };
                }
            }
        }
        console.log('No estamos en ninguna ventana, buscando la próxima...');
        for (const horario of horarios) {
            if (horario.horaInicioVentana && horario.horaFinVentana) {
                if (horaActual < horario.horaInicioVentana) {
                    console.log('Próxima ventana:', horario.tipoMarcaje);
                    const [hInicio, mInicio] = horario.horaInicioVentana.split(':').map(Number);
                    const [hActual, mActual] = horaActual.split(':').map(Number);
                    const minutosHastaInicio = (hInicio * 60 + mInicio) - (hActual * 60 + mActual);
                    return {
                        tipoMarcaje: horario.tipoMarcaje,
                        horaProgramada: horario.horaProgramada,
                        horaInicioVentana: horario.horaInicioVentana,
                        horaFinVentana: horario.horaFinVentana,
                        toleranciaMinutos: horario.toleranciaMinutos,
                        minutosRestantes: minutosHastaInicio,
                        mensaje: `Se activará a las ${horario.horaInicioVentana}`,
                    };
                }
            }
        }
        console.log('Todas las ventanas completadas');
        const primerHorario = horarios[0];
        if (primerHorario) {
            return {
                tipoMarcaje: primerHorario.tipoMarcaje,
                horaProgramada: primerHorario.horaProgramada,
                horaInicioVentana: primerHorario.horaInicioVentana,
                horaFinVentana: primerHorario.horaFinVentana,
                toleranciaMinutos: primerHorario.toleranciaMinutos,
                mensaje: 'Todos los marcajes del día completados. Próximo: mañana',
            };
        }
        return {
            mensaje: 'No hay horarios configurados',
        };
    }
    async validarJornada() {
        const horarios = await this.findAll();
        const errores = [];
        const tiposRequeridos = [
            'INGRESO_MANANA',
            'SALIDA_DESCANSO',
            'INGRESO_TARDE',
            'SALIDA_FINAL',
        ];
        for (const tipo of tiposRequeridos) {
            if (!horarios.find((h) => h.tipoMarcaje === tipo)) {
                errores.push(`Falta configuración para ${tipo}`);
            }
        }
        let minutosAnterior = 0;
        for (const horario of horarios) {
            const [h, m] = horario.horaProgramada.split(':').map(Number);
            const minutos = h * 60 + m;
            if (minutos <= minutosAnterior) {
                errores.push(`${horario.tipoMarcaje} debe ser posterior al marcaje anterior`);
            }
            minutosAnterior = minutos;
        }
        return {
            valido: errores.length === 0,
            errores,
            horarios,
        };
    }
};
exports.ConfiguracionHorariosService = ConfiguracionHorariosService;
exports.ConfiguracionHorariosService = ConfiguracionHorariosService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ConfiguracionHorariosService);
//# sourceMappingURL=configuracion-horarios.service.js.map