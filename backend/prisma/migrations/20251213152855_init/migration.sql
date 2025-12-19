-- CreateEnum
CREATE TYPE "RolUsuario" AS ENUM ('ADMIN', 'RRHH', 'FUNCIONARIO');

-- CreateEnum
CREATE TYPE "TipoMarcaje" AS ENUM ('INGRESO_MANANA', 'SALIDA_DESCANSO', 'INGRESO_TARDE', 'SALIDA_FINAL');

-- CreateEnum
CREATE TYPE "EstadoNotificacion" AS ENUM ('PENDIENTE', 'ENVIADO', 'FALLIDO');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "rol" "RolUsuario" NOT NULL DEFAULT 'FUNCIONARIO',
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "funcionarios" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "apellido" VARCHAR(100) NOT NULL,
    "cargo" VARCHAR(100) NOT NULL,
    "dependencia" VARCHAR(150) NOT NULL,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "usuario_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "funcionarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracion_horarios" (
    "id" SERIAL NOT NULL,
    "tipo_marcaje" "TipoMarcaje" NOT NULL,
    "hora_programada" VARCHAR(5) NOT NULL,
    "tolerancia_minutos" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configuracion_horarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registros_faciales" (
    "id" SERIAL NOT NULL,
    "funcionario_id" INTEGER NOT NULL,
    "embedding" TEXT NOT NULL,
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "registros_faciales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asistencias" (
    "id" SERIAL NOT NULL,
    "funcionario_id" INTEGER NOT NULL,
    "fecha" DATE NOT NULL,
    "hora_marcaje" TIMESTAMP(3) NOT NULL,
    "tipo_marcaje" "TipoMarcaje" NOT NULL,
    "minutos_tardanza" INTEGER NOT NULL DEFAULT 0,
    "verificado" BOOLEAN NOT NULL DEFAULT true,
    "observacion" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "asistencias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logs_notificacion" (
    "id" SERIAL NOT NULL,
    "asistencia_id" INTEGER NOT NULL,
    "canal" VARCHAR(50) NOT NULL,
    "fecha_envio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" "EstadoNotificacion" NOT NULL DEFAULT 'PENDIENTE',
    "mensaje_error" TEXT,

    CONSTRAINT "logs_notificacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resumenes_mensuales" (
    "id" SERIAL NOT NULL,
    "funcionario_id" INTEGER NOT NULL,
    "anio" INTEGER NOT NULL,
    "mes" INTEGER NOT NULL,
    "total_dias_trabajados" INTEGER NOT NULL DEFAULT 0,
    "total_minutos_tardanza" INTEGER NOT NULL DEFAULT 0,
    "total_minutos_trabajados" INTEGER NOT NULL DEFAULT 0,
    "total_ausencias" INTEGER NOT NULL DEFAULT 0,
    "total_permisos" INTEGER NOT NULL DEFAULT 0,
    "reporte_generado" BOOLEAN NOT NULL DEFAULT false,
    "url_reporte_pdf" VARCHAR(255),
    "fecha_generacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resumenes_mensuales_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_username_key" ON "usuarios"("username");

-- CreateIndex
CREATE UNIQUE INDEX "funcionarios_usuario_id_key" ON "funcionarios"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "configuracion_horarios_tipo_marcaje_key" ON "configuracion_horarios"("tipo_marcaje");

-- CreateIndex
CREATE INDEX "registros_faciales_funcionario_id_idx" ON "registros_faciales"("funcionario_id");

-- CreateIndex
CREATE INDEX "asistencias_funcionario_id_fecha_idx" ON "asistencias"("funcionario_id", "fecha");

-- CreateIndex
CREATE UNIQUE INDEX "asistencias_funcionario_id_fecha_tipo_marcaje_key" ON "asistencias"("funcionario_id", "fecha", "tipo_marcaje");

-- CreateIndex
CREATE INDEX "logs_notificacion_asistencia_id_idx" ON "logs_notificacion"("asistencia_id");

-- CreateIndex
CREATE INDEX "resumenes_mensuales_funcionario_id_anio_mes_idx" ON "resumenes_mensuales"("funcionario_id", "anio", "mes");

-- CreateIndex
CREATE UNIQUE INDEX "resumenes_mensuales_funcionario_id_anio_mes_key" ON "resumenes_mensuales"("funcionario_id", "anio", "mes");

-- AddForeignKey
ALTER TABLE "funcionarios" ADD CONSTRAINT "funcionarios_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registros_faciales" ADD CONSTRAINT "registros_faciales_funcionario_id_fkey" FOREIGN KEY ("funcionario_id") REFERENCES "funcionarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asistencias" ADD CONSTRAINT "asistencias_funcionario_id_fkey" FOREIGN KEY ("funcionario_id") REFERENCES "funcionarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logs_notificacion" ADD CONSTRAINT "logs_notificacion_asistencia_id_fkey" FOREIGN KEY ("asistencia_id") REFERENCES "asistencias"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resumenes_mensuales" ADD CONSTRAINT "resumenes_mensuales_funcionario_id_fkey" FOREIGN KEY ("funcionario_id") REFERENCES "funcionarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
