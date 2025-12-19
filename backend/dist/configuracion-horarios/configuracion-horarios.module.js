"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfiguracionHorariosModule = void 0;
const common_1 = require("@nestjs/common");
const configuracion_horarios_service_1 = require("./configuracion-horarios.service");
const configuracion_horarios_controller_1 = require("./configuracion-horarios.controller");
let ConfiguracionHorariosModule = class ConfiguracionHorariosModule {
};
exports.ConfiguracionHorariosModule = ConfiguracionHorariosModule;
exports.ConfiguracionHorariosModule = ConfiguracionHorariosModule = __decorate([
    (0, common_1.Module)({
        controllers: [configuracion_horarios_controller_1.ConfiguracionHorariosController],
        providers: [configuracion_horarios_service_1.ConfiguracionHorariosService],
        exports: [configuracion_horarios_service_1.ConfiguracionHorariosService],
    })
], ConfiguracionHorariosModule);
//# sourceMappingURL=configuracion-horarios.module.js.map