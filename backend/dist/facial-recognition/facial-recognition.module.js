"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FacialRecognitionModule = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const facial_recognition_controller_1 = require("./facial-recognition.controller");
const facial_recognition_service_1 = require("./facial-recognition.service");
const prisma_service_1 = require("../database/prisma.service");
const notifications_module_1 = require("../notifications/notifications.module");
let FacialRecognitionModule = class FacialRecognitionModule {
};
exports.FacialRecognitionModule = FacialRecognitionModule;
exports.FacialRecognitionModule = FacialRecognitionModule = __decorate([
    (0, common_1.Module)({
        imports: [
            platform_express_1.MulterModule.register({
                storage: (0, multer_1.diskStorage)({
                    destination: './uploads/facial',
                    filename: (req, file, callback) => {
                        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                        const ext = (0, path_1.extname)(file.originalname);
                        const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
                        callback(null, filename);
                    },
                }),
                fileFilter: (req, file, callback) => {
                    if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
                        return callback(new Error('Solo se permiten imágenes JPG, JPEG y PNG'), false);
                    }
                    callback(null, true);
                },
                limits: {
                    fileSize: 5 * 1024 * 1024,
                },
            }),
            notifications_module_1.NotificationsModule
        ],
        controllers: [facial_recognition_controller_1.FacialRecognitionController],
        providers: [facial_recognition_service_1.FacialRecognitionService, prisma_service_1.PrismaService],
        exports: [facial_recognition_service_1.FacialRecognitionService],
    })
], FacialRecognitionModule);
//# sourceMappingURL=facial-recognition.module.js.map