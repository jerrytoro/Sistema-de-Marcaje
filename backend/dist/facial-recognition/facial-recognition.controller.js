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
exports.FacialRecognitionController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const facial_recognition_service_1 = require("./facial-recognition.service");
let FacialRecognitionController = class FacialRecognitionController {
    facialService;
    constructor(facialService) {
        this.facialService = facialService;
    }
    async registrarDatosFaciales(funcionarioId, file) {
        if (!file) {
            throw new common_1.BadRequestException('No se proporcionó ninguna imagen');
        }
        return this.facialService.registrarDatosFaciales(funcionarioId, file.path);
    }
    async verificarRostro(file) {
        if (!file) {
            throw new common_1.BadRequestException('No se proporcionó ninguna imagen');
        }
        return this.facialService.verificarRostro(file.path);
    }
    async registrarMarcajeFacial(file, tipoMarcaje) {
        if (!file) {
            throw new common_1.BadRequestException('No se proporcionó ninguna imagen');
        }
        return this.facialService.registrarMarcajeFacial(file.path, tipoMarcaje);
    }
    async obtenerDatosFaciales(funcionarioId) {
        return this.facialService.obtenerDatosFaciales(funcionarioId);
    }
    async listarFuncionariosConDatosFaciales() {
        return this.facialService.listarFuncionariosConDatosFaciales();
    }
    async eliminarDatosFaciales(funcionarioId) {
        return this.facialService.eliminarDatosFaciales(funcionarioId);
    }
};
exports.FacialRecognitionController = FacialRecognitionController;
__decorate([
    (0, common_1.Post)('register/:funcionarioId'),
    (0, roles_decorator_1.Roles)('ADMIN', 'RRHH'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('foto')),
    __param(0, (0, common_1.Param)('funcionarioId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], FacialRecognitionController.prototype, "registrarDatosFaciales", null);
__decorate([
    (0, common_1.Post)('verify'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('foto')),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FacialRecognitionController.prototype, "verificarRostro", null);
__decorate([
    (0, common_1.Post)('marcar'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('foto')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)('tipoMarcaje')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], FacialRecognitionController.prototype, "registrarMarcajeFacial", null);
__decorate([
    (0, common_1.Get)(':funcionarioId'),
    (0, roles_decorator_1.Roles)('ADMIN', 'RRHH'),
    __param(0, (0, common_1.Param)('funcionarioId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], FacialRecognitionController.prototype, "obtenerDatosFaciales", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('ADMIN', 'RRHH'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FacialRecognitionController.prototype, "listarFuncionariosConDatosFaciales", null);
__decorate([
    (0, common_1.Delete)(':funcionarioId'),
    (0, roles_decorator_1.Roles)('ADMIN', 'RRHH'),
    __param(0, (0, common_1.Param)('funcionarioId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], FacialRecognitionController.prototype, "eliminarDatosFaciales", null);
exports.FacialRecognitionController = FacialRecognitionController = __decorate([
    (0, common_1.Controller)('facial-recognition'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [facial_recognition_service_1.FacialRecognitionService])
], FacialRecognitionController);
//# sourceMappingURL=facial-recognition.controller.js.map