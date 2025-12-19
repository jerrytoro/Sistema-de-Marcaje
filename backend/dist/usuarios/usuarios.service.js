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
exports.UsuariosService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
let UsuariosService = class UsuariosService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createUsuarioDto) {
        const { username, password, rol, estado, nombre, apellido, cargo, dependencia } = createUsuarioDto;
        const existingUser = await this.prisma.usuario.findUnique({
            where: { username },
        });
        if (existingUser) {
            throw new common_1.ConflictException('El username ya está en uso');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const usuario = await this.prisma.usuario.create({
            data: {
                username,
                password: hashedPassword,
                rol: rol || 'FUNCIONARIO',
                estado: estado !== undefined ? estado : true,
                funcionario: {
                    create: {
                        nombre,
                        apellido,
                        cargo,
                        dependencia,
                    },
                },
            },
            include: {
                funcionario: true,
            },
        });
        const { password: _, ...usuarioSinPassword } = usuario;
        return usuarioSinPassword;
    }
    async findAll() {
        const usuarios = await this.prisma.usuario.findMany({
            include: {
                funcionario: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return usuarios.map(({ password, ...usuario }) => usuario);
    }
    async findOne(id) {
        const usuario = await this.prisma.usuario.findUnique({
            where: { id },
            include: {
                funcionario: true,
            },
        });
        if (!usuario) {
            throw new common_1.NotFoundException(`Usuario con ID ${id} no encontrado`);
        }
        const { password, ...usuarioSinPassword } = usuario;
        return usuarioSinPassword;
    }
    async update(id, updateUsuarioDto) {
        const { username, rol, estado, nombre, apellido, cargo, dependencia } = updateUsuarioDto;
        const usuarioExistente = await this.prisma.usuario.findUnique({
            where: { id },
            include: { funcionario: true },
        });
        if (!usuarioExistente) {
            throw new common_1.NotFoundException(`Usuario con ID ${id} no encontrado`);
        }
        if (username && username !== usuarioExistente.username) {
            const usernameEnUso = await this.prisma.usuario.findUnique({
                where: { username },
            });
            if (usernameEnUso) {
                throw new common_1.ConflictException('El username ya está en uso');
            }
        }
        const dataUsuario = {};
        if (username)
            dataUsuario.username = username;
        if (rol)
            dataUsuario.rol = rol;
        if (estado !== undefined)
            dataUsuario.estado = estado;
        const dataFuncionario = {};
        if (nombre)
            dataFuncionario.nombre = nombre;
        if (apellido)
            dataFuncionario.apellido = apellido;
        if (cargo)
            dataFuncionario.cargo = cargo;
        if (dependencia)
            dataFuncionario.dependencia = dependencia;
        const usuario = await this.prisma.usuario.update({
            where: { id },
            data: {
                ...dataUsuario,
                ...(Object.keys(dataFuncionario).length > 0 && {
                    funcionario: {
                        update: dataFuncionario,
                    },
                }),
            },
            include: {
                funcionario: true,
            },
        });
        const { password, ...usuarioSinPassword } = usuario;
        return usuarioSinPassword;
    }
    async changePassword(id, changePasswordDto, requestUserId) {
        const { currentPassword, newPassword } = changePasswordDto;
        const usuario = await this.prisma.usuario.findUnique({
            where: { id },
        });
        if (!usuario) {
            throw new common_1.NotFoundException(`Usuario con ID ${id} no encontrado`);
        }
        const isPasswordValid = await bcrypt.compare(currentPassword, usuario.password);
        if (!isPasswordValid) {
            throw new common_1.BadRequestException('Contraseña actual incorrecta');
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await this.prisma.usuario.update({
            where: { id },
            data: { password: hashedPassword },
        });
        return { message: 'Contraseña actualizada exitosamente' };
    }
    async toggleEstado(id, estado) {
        const usuario = await this.prisma.usuario.findUnique({
            where: { id },
        });
        if (!usuario) {
            throw new common_1.NotFoundException(`Usuario con ID ${id} no encontrado`);
        }
        const usuarioActualizado = await this.prisma.usuario.update({
            where: { id },
            data: { estado },
            include: {
                funcionario: true,
            },
        });
        const { password, ...usuarioSinPassword } = usuarioActualizado;
        return usuarioSinPassword;
    }
    async remove(id) {
        const usuario = await this.prisma.usuario.findUnique({
            where: { id },
        });
        if (!usuario) {
            throw new common_1.NotFoundException(`Usuario con ID ${id} no encontrado`);
        }
        await this.prisma.usuario.update({
            where: { id },
            data: { estado: false },
        });
        return { message: `Usuario ${usuario.username} desactivado exitosamente` };
    }
    async hardDelete(id) {
        const usuario = await this.prisma.usuario.findUnique({
            where: { id },
        });
        if (!usuario) {
            throw new common_1.NotFoundException(`Usuario con ID ${id} no encontrado`);
        }
        await this.prisma.usuario.delete({
            where: { id },
        });
        return { message: `Usuario ${usuario.username} eliminado permanentemente` };
    }
};
exports.UsuariosService = UsuariosService;
exports.UsuariosService = UsuariosService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsuariosService);
//# sourceMappingURL=usuarios.service.js.map