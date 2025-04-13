/*
  Warnings:

  - You are about to drop the column `Height` on the `Space` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Space" DROP COLUMN "Height",
ADD COLUMN     "height" INTEGER;
