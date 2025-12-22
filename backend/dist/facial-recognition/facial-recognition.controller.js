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
const facial_recognition_service_1 = require("./facial-recognition.service");
let FacialRecognitionController = class FacialRecognitionController {
    facialRecognitionService;
    constructor(facialRecognitionService) {
        this.facialRecognitionService = facialRecognitionService;
    }
    async registrar(funcionarioId, foto) {
        return this.facialRecognitionService.registrarDatosFaciales(funcionarioId, foto);
    }
    async registrarMultiple(funcionarioId, fotos, body) {
        console.log('🎯 ===== CONTROLLER: register-multiple =====');
        console.log('📝 Funcionario ID:', funcionarioId);
        console.log('📝 Fotos recibidas:', fotos?.length);
        console.log('📝 Body recibido:', body);
        console.log('📝 Nombres de archivos:', fotos?.map(f => f.originalname));
        console.log('========================================');
        return this.facialRecognitionService.registrarMultiple(funcionarioId, fotos, body);
    }
    async marcar(foto) {
        return this.facialRecognitionService.verificarYMarcar(foto);
    }
    async obtenerEstado(funcionarioId) {
        return this.facialRecognitionService.obtenerEstado(funcionarioId);
    }
    async eliminarRegistros(funcionarioId) {
        return this.facialRecognitionService.eliminarRegistros(funcionarioId);
    }
};
exports.FacialRecognitionController = FacialRecognitionController;
__decorate([
    (0, common_1.Post)('register/:id'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('foto')),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], FacialRecognitionController.prototype, "registrar", null);
__decorate([
    (0, common_1.Post)('register-multiple/:id'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('foto', 5)),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.UploadedFiles)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Array, Object]),
    __metadata("design:returntype", Promise)
], FacialRecognitionController.prototype, "registrarMultiple", null);
__decorate([
    (0, common_1.Post)('marcar'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('foto')),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FacialRecognitionController.prototype, "marcar", null);
__decorate([
    (0, common_1.Get)('status/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], FacialRecognitionController.prototype, "obtenerEstado", null);
__decorate([
    (0, common_1.Post)('delete/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], FacialRecognitionController.prototype, "eliminarRegistros", null);
exports.FacialRecognitionController = FacialRecognitionController = __decorate([
    (0, common_1.Controller)('facial-recognition'),
    __metadata("design:paramtypes", [facial_recognition_service_1.FacialRecognitionService])
], FacialRecognitionController);
//# sourceMappingURL=facial-recognition.controller.js.map