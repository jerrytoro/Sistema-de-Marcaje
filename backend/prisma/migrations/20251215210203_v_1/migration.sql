-- AlterTable
ALTER TABLE "funcionarios" ADD COLUMN     "facialDataRegistered" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "telegramChatId" TEXT;

-- CreateTable
CREATE TABLE "facial_data" (
    "id" SERIAL NOT NULL,
    "funcionarioId" INTEGER NOT NULL,
    "descriptores" JSONB NOT NULL,
    "fotoReferencia" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "confianza" DOUBLE PRECISION NOT NULL DEFAULT 0.7,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "facial_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marcajes_faciales" (
    "id" SERIAL NOT NULL,
    "asistenciaId" INTEGER NOT NULL,
    "fotoEvidencia" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "marcajes_faciales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "telegram_link_tokens" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "funcionarioId" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usado" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "telegram_link_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "facial_data_funcionarioId_key" ON "facial_data"("funcionarioId");

-- CreateIndex
CREATE UNIQUE INDEX "marcajes_faciales_asistenciaId_key" ON "marcajes_faciales"("asistenciaId");

-- CreateIndex
CREATE UNIQUE INDEX "telegram_link_tokens_token_key" ON "telegram_link_tokens"("token");

-- AddForeignKey
ALTER TABLE "facial_data" ADD CONSTRAINT "facial_data_funcionarioId_fkey" FOREIGN KEY ("funcionarioId") REFERENCES "funcionarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marcajes_faciales" ADD CONSTRAINT "marcajes_faciales_asistenciaId_fkey" FOREIGN KEY ("asistenciaId") REFERENCES "asistencias"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "telegram_link_tokens" ADD CONSTRAINT "telegram_link_tokens_funcionarioId_fkey" FOREIGN KEY ("funcionarioId") REFERENCES "funcionarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
