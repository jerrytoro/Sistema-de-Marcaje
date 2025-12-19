/*
  Warnings:

  - You are about to drop the column `fotoEvidencia` on the `marcajes_faciales` table. All the data in the column will be lost.
  - Added the required column `foto_evidencia` to the `marcajes_faciales` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "marcajes_faciales" DROP COLUMN "fotoEvidencia",
ADD COLUMN     "foto_evidencia" TEXT NOT NULL;
