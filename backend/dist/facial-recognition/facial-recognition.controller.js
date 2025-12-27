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
const facial_recognition_service_1 = require("./facial-recognition.service");
let FacialRecognitionController = class FacialRecognitionController {
    facialRecognitionService;
    constructor(facialRecognitionService) {
        this.facialRecognitionService = facialRecognitionService;
    }
    async registrarDescriptores(funcionarioId, body) {
        console.log('🎯 ===== CONTROLLER: registrar-descriptores =====');
        console.log('📝 Funcionario ID:', funcionarioId);
        console.log('📝 Body recibido:', JSON.stringify(body).substring(0, 200));
        console.log('📝 Descriptores:', body.descriptores?.length);
        console.log('========================================');
        return this.facialRecognitionService.registrarDescriptores(funcionarioId, body.descriptores);
    }
    async verificarDescriptor(body) {
        console.log('🎯 ===== CONTROLLER: verificar-descriptor =====');
        console.log('📝 Descriptor recibido:', body.descriptor?.length, 'valores');
        console.log('========================================');
        return this.facialRecognitionService.verificarDescriptor(body.descriptor);
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
    (0, common_1.Post)('registrar-descriptores/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], FacialRecognitionController.prototype, "registrarDescriptores", null);
__decorate([
    (0, common_1.Post)('verificar-descriptor'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FacialRecognitionController.prototype, "verificarDescriptor", null);
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