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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FuncionariosController = void 0;
const common_1 = require("@nestjs/common");
const funcionarios_service_1 = require("./funcionarios.service");
const update_funcionario_dto_1 = require("./dto/update-funcionario.dto");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
let FuncionariosController = class FuncionariosController {
    funcionariosService;
    constructor(funcionariosService) {
        this.funcionariosService = funcionariosService;
    }
    findAll(activos) {
        if (activos === 'true') {
            return this.funcionariosService.findActive();
        }
        return this.funcionariosService.findAll();
    }
    getDependencias() {
        return this.funcionariosService.getDependencias();
    }
    getCargos() {
        return this.funcionariosService.getCargos();
    }
    search(termino) {
        return this.funcionariosService.search(termino);
    }
    findByDependencia(nombre) {
        return this.funcionariosService.findByDependencia(nombre);
    }
    findByCargo(nombre) {
        return this.funcionariosService.findByCargo(nombre);
    }
    findOne(id) {
        return this.funcionariosService.findOne(id);
    }
    getRegistrosFaciales(id) {
        return this.funcionariosService.getRegistrosFaciales(id);
    }
    getAsistencias(id, mes, anio) {
        return this.funcionariosService.getAsistencias(id, mes, anio);
    }
    getEstadisticas(id) {
        return this.funcionariosService.getEstadisticas(id);
    }
    update(id, updateFuncionarioDto) {
        return this.funcionariosService.update(id, updateFuncionarioDto);
    }
};
exports.FuncionariosController = FuncionariosController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('ADMIN', 'RRHH'),
    __param(0, (0, common_1.Query)('activos')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FuncionariosController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('dependencias'),
    (0, roles_decorator_1.Roles)('ADMIN', 'RRHH'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], FuncionariosController.prototype, "getDependencias", null);
__decorate([
    (0, common_1.Get)('cargos'),
    (0, roles_decorator_1.Roles)('ADMIN', 'RRHH'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], FuncionariosController.prototype, "getCargos", null);
__decorate([
    (0, common_1.Get)('buscar/:termino'),
    (0, roles_decorator_1.Roles)('ADMIN', 'RRHH'),
    __param(0, (0, common_1.Param)('termino')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FuncionariosController.prototype, "search", null);
__decorate([
    (0, common_1.Get)('dependencia/:nombre'),
    (0, roles_decorator_1.Roles)('ADMIN', 'RRHH'),
    __param(0, (0, common_1.Param)('nombre')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FuncionariosController.prototype, "findByDependencia", null);
__decorate([
    (0, common_1.Get)('cargo/:nombre'),
    (0, roles_decorator_1.Roles)('ADMIN', 'RRHH'),
    __param(0, (0, common_1.Param)('nombre')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FuncionariosController.prototype, "findByCargo", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)('ADMIN', 'RRHH'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], FuncionariosController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/registros-faciales'),
    (0, roles_decorator_1.Roles)('ADMIN', 'RRHH'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], FuncionariosController.prototype, "getRegistrosFaciales", null);
__decorate([
    (0, common_1.Get)(':id/asistencias'),
    (0, roles_decorator_1.Roles)('ADMIN', 'RRHH'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('mes', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('anio', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Number]),
    __metadata("design:returntype", void 0)
], FuncionariosController.prototype, "getAsistencias", null);
__decorate([
    (0, common_1.Get)(':id/estadisticas'),
    (0, roles_decorator_1.Roles)('ADMIN', 'RRHH'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], FuncionariosController.prototype, "getEstadisticas", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_funcionario_dto_1.UpdateFuncionarioDto]),
    __metadata("design:returntype", void 0)
], FuncionariosController.prototype, "update", null);
exports.FuncionariosController = FuncionariosController = __decorate([
    (0, common_1.Controller)('funcionarios'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [funcionarios_service_1.FuncionariosService])
], FuncionariosController);
//# sourceMappingURL=funcionarios.controller.js.map