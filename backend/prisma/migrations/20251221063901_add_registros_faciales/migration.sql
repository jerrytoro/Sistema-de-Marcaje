/*
  Warnings:

  - You are about to drop the column `activo` on the `registros_faciales` table. All the data in the column will be lost.
  - You are about to drop the column `embedding` on the `registros_faciales` table. All the data in the column will be lost.
  - You are about to drop the column `fecha_registro` on the `registros_faciales` table. All the data in the column will be lost.
  - Added the required column `facial_data` to the `registros_faciales` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "registros_faciales" DROP COLUMN "activo",
DROP COLUMN "embedding",
DROP COLUMN "fecha_registro",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "facial_data" TEXT NOT NULL,
ADD COLUMN     "metadata" JSONB;
