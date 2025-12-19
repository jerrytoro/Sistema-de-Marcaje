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
exports.UpdateAsistenciaDto = void 0;
const class_validator_1 = require("class-validator");
class UpdateAsistenciaDto {
    fecha;
    horaMarcaje;
    tipoMarcaje;
    minutosTardanza;
    verificado;
    observacion;
}
exports.UpdateAsistenciaDto = UpdateAsistenciaDto;
__decorate([
    (0, class_validator_1.IsDateString)({}, { message: 'La fecha debe estar en formato ISO (YYYY-MM-DD)' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateAsistenciaDto.prototype, "fecha", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateAsistenciaDto.prototype, "horaMarcaje", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['INGRESO_MANANA', 'SALIDA_DESCANSO', 'INGRESO_TARDE', 'SALIDA_FINAL']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateAsistenciaDto.prototype, "tipoMarcaje", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateAsistenciaDto.prototype, "minutosTardanza", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateAsistenciaDto.prototype, "verificado", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateAsistenciaDto.prototype, "observacion", void 0);
//# sourceMappingURL=update-asistencia.dto.js.map