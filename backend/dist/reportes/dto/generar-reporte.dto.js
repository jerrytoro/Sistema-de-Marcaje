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
exports.GenerarReporteDto = void 0;
const class_validator_1 = require("class-validator");
class GenerarReporteDto {
    funcionarioId;
    anio;
    mes;
}
exports.GenerarReporteDto = GenerarReporteDto;
__decorate([
    (0, class_validator_1.IsInt)({ message: 'El ID del funcionario debe ser un número entero' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'El ID del funcionario es requerido' }),
    __metadata("design:type", Number)
], GenerarReporteDto.prototype, "funcionarioId", void 0);
__decorate([
    (0, class_validator_1.IsInt)({ message: 'El año debe ser un número entero' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'El año es requerido' }),
    (0, class_validator_1.Min)(2020, { message: 'El año debe ser mayor o igual a 2020' }),
    (0, class_validator_1.Max)(2100, { message: 'El año debe ser menor o igual a 2100' }),
    __metadata("design:type", Number)
], GenerarReporteDto.prototype, "anio", void 0);
__decorate([
    (0, class_validator_1.IsInt)({ message: 'El mes debe ser un número entero' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'El mes es requerido' }),
    (0, class_validator_1.Min)(1, { message: 'El mes debe estar entre 1 y 12' }),
    (0, class_validator_1.Max)(12, { message: 'El mes debe estar entre 1 y 12' }),
    __metadata("design:type", Number)
], GenerarReporteDto.prototype, "mes", void 0);
//# sourceMappingURL=generar-reporte.dto.js.map