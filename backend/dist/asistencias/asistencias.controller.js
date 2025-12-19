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
exports.AsistenciasController = void 0;
const common_1 = require("@nestjs/common");
const asistencias_service_1 = require("./asistencias.service");
const create_asistencia_dto_1 = require("./dto/create-asistencia.dto");
const update_asistencia_dto_1 = require("./dto/update-asistencia.dto");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
let AsistenciasController = class AsistenciasController {
    asistenciasService;
    constructor(asistenciasService) {
        this.asistenciasService = asistenciasService;
    }
    create(createAsistenciaDto) {
        return this.asistenciasService.create(createAsistenciaDto);
    }
    findAll(limit, offset) {
        const limitNum = limit ? parseInt(limit, 10) : undefined;
        const offsetNum = offset ? parseInt(offset, 10) : undefined;
        return this.asistenciasService.findAll(limitNum, offsetNum);
    }
    findToday() {
        return this.asistenciasService.findToday();
    }
    getEstadisticas(mes, anio) {
        const mesNum = mes ? parseInt(mes, 10) : undefined;
        const anioNum = anio ? parseInt(anio, 10) : undefined;
        return this.asistenciasService.getEstadisticas(mesNum, anioNum);
    }
    findByDate(fecha) {
        return this.asistenciasService.findByDate(fecha);
    }
    findByMonth(mes, anio) {
        return this.asistenciasService.findByMonth(mes, anio);
    }
    findByFuncionario(id, mes, anio) {
        const mesNum = mes ? parseInt(mes, 10) : undefined;
        const anioNum = anio ? parseInt(anio, 10) : undefined;
        return this.asistenciasService.findByFuncionario(id, mesNum, anioNum);
    }
    findOne(id) {
        return this.asistenciasService.findOne(id);
    }
    update(id, updateAsistenciaDto) {
        return this.asistenciasService.update(id, updateAsistenciaDto);
    }
    remove(id) {
        return this.asistenciasService.remove(id);
    }
};
exports.AsistenciasController = AsistenciasController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('ADMIN', 'RRHH'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_asistencia_dto_1.CreateAsistenciaDto]),
    __metadata("design:returntype", void 0)
], AsistenciasController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('ADMIN', 'RRHH'),
    __param(0, (0, common_1.Query)('limit')),
    __param(1, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AsistenciasController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('hoy'),
    (0, roles_decorator_1.Roles)('ADMIN', 'RRHH'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AsistenciasController.prototype, "findToday", null);
__decorate([
    (0, common_1.Get)('estadisticas'),
    (0, roles_decorator_1.Roles)('ADMIN', 'RRHH'),
    __param(0, (0, common_1.Query)('mes')),
    __param(1, (0, common_1.Query)('anio')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AsistenciasController.prototype, "getEstadisticas", null);
__decorate([
    (0, common_1.Get)('fecha/:fecha'),
    (0, roles_decorator_1.Roles)('ADMIN', 'RRHH'),
    __param(0, (0, common_1.Param)('fecha')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AsistenciasController.prototype, "findByDate", null);
__decorate([
    (0, common_1.Get)('mes/:mes/anio/:anio'),
    (0, roles_decorator_1.Roles)('ADMIN', 'RRHH'),
    __param(0, (0, common_1.Param)('mes', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('anio', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], AsistenciasController.prototype, "findByMonth", null);
__decorate([
    (0, common_1.Get)('funcionario/:id'),
    (0, roles_decorator_1.Roles)('ADMIN', 'RRHH'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('mes')),
    __param(2, (0, common_1.Query)('anio')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String]),
    __metadata("design:returntype", void 0)
], AsistenciasController.prototype, "findByFuncionario", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)('ADMIN', 'RRHH'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AsistenciasController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_asistencia_dto_1.UpdateAsistenciaDto]),
    __metadata("design:returntype", void 0)
], AsistenciasController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AsistenciasController.prototype, "remove", null);
exports.AsistenciasController = AsistenciasController = __decorate([
    (0, common_1.Controller)('asistencias'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [asistencias_service_1.AsistenciasService])
], AsistenciasController);
//# sourceMappingURL=asistencias.controller.js.map