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
exports.UpdateAllHorariosDto = exports.UpdateHorarioDto = void 0;
const class_validator_1 = require("class-validator");
class UpdateHorarioDto {
    horaProgramada;
    toleranciaMinutos;
}
exports.UpdateHorarioDto = UpdateHorarioDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Matches)(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
        message: 'La hora debe estar en formato HH:MM (00:00 - 23:59)',
    }),
    __metadata("design:type", String)
], UpdateHorarioDto.prototype, "horaProgramada", void 0);
__decorate([
    (0, class_validator_1.IsInt)({ message: 'La tolerancia debe ser un número entero' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(0, { message: 'La tolerancia no puede ser negativa' }),
    (0, class_validator_1.Max)(60, { message: 'La tolerancia no puede ser mayor a 60 minutos' }),
    __metadata("design:type", Number)
], UpdateHorarioDto.prototype, "toleranciaMinutos", void 0);
class UpdateAllHorariosDto {
    INGRESO_MANANA;
    SALIDA_DESCANSO;
    INGRESO_TARDE;
    SALIDA_FINAL;
}
exports.UpdateAllHorariosDto = UpdateAllHorariosDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", UpdateHorarioDto)
], UpdateAllHorariosDto.prototype, "INGRESO_MANANA", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", UpdateHorarioDto)
], UpdateAllHorariosDto.prototype, "SALIDA_DESCANSO", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", UpdateHorarioDto)
], UpdateAllHorariosDto.prototype, "INGRESO_TARDE", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", UpdateHorarioDto)
], UpdateAllHorariosDto.prototype, "SALIDA_FINAL", void 0);
//# sourceMappingURL=update-horario.dto.js.map