"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const database_module_1 = require("./database/database.module");
const auth_module_1 = require("./auth/auth.module");
const usuarios_module_1 = require("./usuarios/usuarios.module");
const funcionarios_module_1 = require("./funcionarios/funcionarios.module");
const configuracion_horarios_module_1 = require("./configuracion-horarios/configuracion-horarios.module");
const asistencias_module_1 = require("./asistencias/asistencias.module");
const reportes_module_1 = require("./reportes/reportes.module");
const jwt_auth_guard_1 = require("./auth/guards/jwt-auth.guard");
const facial_recognition_module_1 = require("./facial-recognition/facial-recognition.module");
const notifications_module_1 = require("./notifications/notifications.module");
const scheduled_tasks_module_1 = require("./scheduled-tasks/scheduled-tasks.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            database_module_1.DatabaseModule,
            auth_module_1.AuthModule,
            usuarios_module_1.UsuariosModule,
            funcionarios_module_1.FuncionariosModule,
            configuracion_horarios_module_1.ConfiguracionHorariosModule,
            asistencias_module_1.AsistenciasModule,
            reportes_module_1.ReportesModule,
            facial_recognition_module_1.FacialRecognitionModule,
            notifications_module_1.NotificationsModule,
            scheduled_tasks_module_1.ScheduledTasksModule,
        ],
        controllers: [],
        providers: [
            {
                provide: core_1.APP_GUARD,
                useClass: jwt_auth_guard_1.JwtAuthGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map