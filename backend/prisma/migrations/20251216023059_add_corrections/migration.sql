/*
  Warnings:

  - You are about to drop the column `createdAt` on the `facial_data` table. All the data in the column will be lost.
  - You are about to drop the column `funcionarioId` on the `facial_data` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `facial_data` table. All the data in the column will be lost.
  - You are about to drop the column `facialDataRegistered` on the `funcionarios` table. All the data in the column will be lost.
  - You are about to drop the column `telegramChatId` on the `funcionarios` table. All the data in the column will be lost.
  - You are about to drop the column `asistenciaId` on the `marcajes_faciales` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `marcajes_faciales` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `telegram_link_tokens` table. All the data in the column will be lost.
  - You are about to drop the column `expiresAt` on the `telegram_link_tokens` table. All the data in the column will be lost.
  - You are about to drop the column `funcionarioId` on the `telegram_link_tokens` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[funcionario_id]` on the table `facial_data` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[asistencia_id]` on the table `marcajes_faciales` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `funcionario_id` to the `facial_data` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `facial_data` table without a default value. This is not possible if the table is not empty.
  - Added the required column `asistencia_id` to the `marcajes_faciales` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expires_at` to the `telegram_link_tokens` table without a default value. This is not possible if the table is not empty.
  - Added the required column `funcionario_id` to the `telegram_link_tokens` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "facial_data" DROP CONSTRAINT "facial_data_funcionarioId_fkey";

-- DropForeignKey
ALTER TABLE "marcajes_faciales" DROP CONSTRAINT "marcajes_faciales_asistenciaId_fkey";

-- DropForeignKey
ALTER TABLE "telegram_link_tokens" DROP CONSTRAINT "telegram_link_tokens_funcionarioId_fkey";

-- DropIndex
DROP INDEX "facial_data_funcionarioId_key";

-- DropIndex
DROP INDEX "marcajes_faciales_asistenciaId_key";

-- AlterTable
ALTER TABLE "facial_data" DROP COLUMN "createdAt",
DROP COLUMN "funcionarioId",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "funcionario_id" INTEGER NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "funcionarios" DROP COLUMN "facialDataRegistered",
DROP COLUMN "telegramChatId",
ADD COLUMN     "facial_data_registered" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "telegram_chat_id" TEXT;

-- AlterTable
ALTER TABLE "marcajes_faciales" DROP COLUMN "asistenciaId",
DROP COLUMN "createdAt",
ADD COLUMN     "asistencia_id" INTEGER NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "telegram_link_tokens" DROP COLUMN "createdAt",
DROP COLUMN "expiresAt",
DROP COLUMN "funcionarioId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "expires_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "funcionario_id" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "facial_data_funcionario_id_key" ON "facial_data"("funcionario_id");

-- CreateIndex
CREATE UNIQUE INDEX "marcajes_faciales_asistencia_id_key" ON "marcajes_faciales"("asistencia_id");

-- AddForeignKey
ALTER TABLE "facial_data" ADD CONSTRAINT "facial_data_funcionario_id_fkey" FOREIGN KEY ("funcionario_id") REFERENCES "funcionarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marcajes_faciales" ADD CONSTRAINT "marcajes_faciales_asistencia_id_fkey" FOREIGN KEY ("asistencia_id") REFERENCES "asistencias"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "telegram_link_tokens" ADD CONSTRAINT "telegram_link_tokens_funcionario_id_fkey" FOREIGN KEY ("funcionario_id") REFERENCES "funcionarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
