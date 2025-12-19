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
exports.ConfiguracionHorariosController = void 0;
const common_1 = require("@nestjs/common");
const configuracion_horarios_service_1 = require("./configuracion-horarios.service");
const update_horario_dto_1 = require("./dto/update-horario.dto");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const public_decorator_1 = require("../auth/decorators/public.decorator");
const client_1 = require("@prisma/client");
let ConfiguracionHorariosController = class ConfiguracionHorariosController {
    configuracionHorariosService;
    constructor(configuracionHorariosService) {
        this.configuracionHorariosService = configuracionHorariosService;
    }
    findAll() {
        return this.configuracionHorariosService.findAll();
    }
    validar() {
        return this.configuracionHorariosService.validarJornada();
    }
    getSiguienteMarcaje() {
        return this.configuracionHorariosService.getSiguienteMarcaje();
    }
    findOne(tipoMarcaje) {
        return this.configuracionHorariosService.findOne(tipoMarcaje);
    }
    updateAll(updateAllHorariosDto) {
        return this.configuracionHorariosService.updateAll(updateAllHorariosDto);
    }
    update(tipoMarcaje, updateHorarioDto) {
        return this.configuracionHorariosService.update(tipoMarcaje, updateHorarioDto);
    }
    reset() {
        return this.configuracionHorariosService.reset();
    }
    verificarConflictos(tipoMarcaje, hora) {
        return this.configuracionHorariosService.verificarConflictos(tipoMarcaje, hora);
    }
};
exports.ConfiguracionHorariosController = ConfiguracionHorariosController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ConfiguracionHorariosController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('validar'),
    (0, roles_decorator_1.Roles)(client_1.RolUsuario.ADMIN, client_1.RolUsuario.RRHH),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ConfiguracionHorariosController.prototype, "validar", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('siguiente'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ConfiguracionHorariosController.prototype, "getSiguienteMarcaje", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(':tipoMarcaje'),
    __param(0, (0, common_1.Param)('tipoMarcaje')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ConfiguracionHorariosController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)('bulk'),
    (0, roles_decorator_1.Roles)(client_1.RolUsuario.ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_horario_dto_1.UpdateAllHorariosDto]),
    __metadata("design:returntype", void 0)
], ConfiguracionHorariosController.prototype, "updateAll", null);
__decorate([
    (0, common_1.Patch)(':tipoMarcaje'),
    (0, roles_decorator_1.Roles)(client_1.RolUsuario.ADMIN),
    __param(0, (0, common_1.Param)('tipoMarcaje')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_horario_dto_1.UpdateHorarioDto]),
    __metadata("design:returntype", void 0)
], ConfiguracionHorariosController.prototype, "update", null);
__decorate([
    (0, common_1.Post)('reset'),
    (0, roles_decorator_1.Roles)(client_1.RolUsuario.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ConfiguracionHorariosController.prototype, "reset", null);
__decorate([
    (0, common_1.Get)(':tipoMarcaje/conflictos/:hora'),
    (0, roles_decorator_1.Roles)(client_1.RolUsuario.ADMIN, client_1.RolUsuario.RRHH),
    __param(0, (0, common_1.Param)('tipoMarcaje')),
    __param(1, (0, common_1.Param)('hora')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ConfiguracionHorariosController.prototype, "verificarConflictos", null);
exports.ConfiguracionHorariosController = ConfiguracionHorariosController = __decorate([
    (0, common_1.Controller)('configuracion-horarios'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [configuracion_horarios_service_1.ConfiguracionHorariosService])
], ConfiguracionHorariosController);
//# sourceMappingURL=configuracion-horarios.controller.js.map