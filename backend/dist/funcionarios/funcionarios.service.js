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
exports.FuncionariosService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
let FuncionariosService = class FuncionariosService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        const funcionarios = await this.prisma.funcionario.findMany({
            include: {
                usuario: {
                    select: {
                        id: true,
                        username: true,
                        rol: true,
                        estado: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return funcionarios;
    }
    async findActive() {
        const funcionarios = await this.prisma.funcionario.findMany({
            where: {
                estado: true,
                usuario: {
                    estado: true,
                },
            },
            include: {
                usuario: {
                    select: {
                        id: true,
                        username: true,
                        rol: true,
                        estado: true,
                    },
                },
            },
            orderBy: {
                apellido: 'asc',
            },
        });
        return funcionarios;
    }
    async findOne(id) {
        const funcionario = await this.prisma.funcionario.findUnique({
            where: { id },
            include: {
                usuario: {
                    select: {
                        id: true,
                        username: true,
                        rol: true,
                        estado: true,
                        createdAt: true,
                    },
                },
                registrosFaciales: {
                    orderBy: {
                        createdAt: 'desc',
                    },
                    take: 5,
                },
                asistencias: {
                    orderBy: {
                        fecha: 'desc',
                    },
                    take: 10,
                },
            },
        });
        if (!funcionario) {
            throw new common_1.NotFoundException(`Funcionario con ID ${id} no encontrado`);
        }
        return funcionario;
    }
    async findByUsuarioId(usuarioId) {
        const funcionario = await this.prisma.funcionario.findUnique({
            where: { usuarioId },
            include: {
                usuario: {
                    select: {
                        id: true,
                        username: true,
                        rol: true,
                        estado: true,
                    },
                },
            },
        });
        if (!funcionario) {
            throw new common_1.NotFoundException(`Funcionario del usuario ${usuarioId} no encontrado`);
        }
        return funcionario;
    }
    async search(termino) {
        const funcionarios = await this.prisma.funcionario.findMany({
            where: {
                OR: [
                    {
                        nombre: {
                            contains: termino,
                            mode: 'insensitive',
                        },
                    },
                    {
                        apellido: {
                            contains: termino,
                            mode: 'insensitive',
                        },
                    },
                ],
            },
            include: {
                usuario: {
                    select: {
                        id: true,
                        username: true,
                        rol: true,
                        estado: true,
                    },
                },
            },
            orderBy: {
                apellido: 'asc',
            },
        });
        return funcionarios;
    }
    async findByDependencia(dependencia) {
        const funcionarios = await this.prisma.funcionario.findMany({
            where: {
                dependencia: {
                    contains: dependencia,
                    mode: 'insensitive',
                },
            },
            include: {
                usuario: {
                    select: {
                        id: true,
                        username: true,
                        rol: true,
                        estado: true,
                    },
                },
            },
            orderBy: {
                apellido: 'asc',
            },
        });
        return funcionarios;
    }
    async findByCargo(cargo) {
        const funcionarios = await this.prisma.funcionario.findMany({
            where: {
                cargo: {
                    contains: cargo,
                    mode: 'insensitive',
                },
            },
            include: {
                usuario: {
                    select: {
                        id: true,
                        username: true,
                        rol: true,
                        estado: true,
                    },
                },
            },
            orderBy: {
                apellido: 'asc',
            },
        });
        return funcionarios;
    }
    async update(id, updateFuncionarioDto) {
        const funcionario = await this.prisma.funcionario.findUnique({
            where: { id },
        });
        if (!funcionario) {
            throw new common_1.NotFoundException(`Funcionario con ID ${id} no encontrado`);
        }
        const funcionarioActualizado = await this.prisma.funcionario.update({
            where: { id },
            data: updateFuncionarioDto,
            include: {
                usuario: {
                    select: {
                        id: true,
                        username: true,
                        rol: true,
                        estado: true,
                    },
                },
            },
        });
        return funcionarioActualizado;
    }
    async getRegistrosFaciales(id) {
        const funcionario = await this.prisma.funcionario.findUnique({
            where: { id },
        });
        if (!funcionario) {
            throw new common_1.NotFoundException(`Funcionario con ID ${id} no encontrado`);
        }
        const registros = await this.prisma.registroFacial.findMany({
            where: { funcionarioId: id },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return registros;
    }
    async getAsistencias(id, mes, anio) {
        const funcionario = await this.prisma.funcionario.findUnique({
            where: { id },
        });
        if (!funcionario) {
            throw new common_1.NotFoundException(`Funcionario con ID ${id} no encontrado`);
        }
        const whereClause = {
            funcionarioId: id,
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
            orderBy: {
                fecha: 'desc',
            },
        });
        return asistencias;
    }
    async getEstadisticas(id) {
        const funcionario = await this.prisma.funcionario.findUnique({
            where: { id },
        });
        if (!funcionario) {
            throw new common_1.NotFoundException(`Funcionario con ID ${id} no encontrado`);
        }
        const totalAsistencias = await this.prisma.asistencia.count({
            where: { funcionarioId: id },
        });
        const totalRegistrosFaciales = await this.prisma.registroFacial.count({
            where: { funcionarioId: id },
        });
        const tardanzas = await this.prisma.asistencia.aggregate({
            where: {
                funcionarioId: id,
                minutosTardanza: {
                    gt: 0,
                },
            },
            _sum: {
                minutosTardanza: true,
            },
            _count: true,
        });
        return {
            funcionario: {
                id: funcionario.id,
                nombreCompleto: `${funcionario.nombre} ${funcionario.apellido}`,
                cargo: funcionario.cargo,
                dependencia: funcionario.dependencia,
            },
            estadisticas: {
                totalAsistencias,
                totalRegistrosFaciales,
                totalTardanzas: tardanzas._count,
                minutosTardanzaTotal: tardanzas._sum.minutosTardanza || 0,
            },
        };
    }
    async getDependencias() {
        const funcionarios = await this.prisma.funcionario.findMany({
            select: {
                dependencia: true,
            },
            distinct: ['dependencia'],
            orderBy: {
                dependencia: 'asc',
            },
        });
        return funcionarios.map((f) => f.dependencia);
    }
    async getCargos() {
        const funcionarios = await this.prisma.funcionario.findMany({
            select: {
                cargo: true,
            },
            distinct: ['cargo'],
            orderBy: {
                cargo: 'asc',
            },
        });
        return funcionarios.map((f) => f.cargo);
    }
};
exports.FuncionariosService = FuncionariosService;
exports.FuncionariosService = FuncionariosService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FuncionariosService);
//# sourceMappingURL=funcionarios.service.js.map