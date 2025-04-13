/*
  Warnings:

  - Made the column `height` on table `Space` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "Space_name_key";

-- AlterTable
ALTER TABLE "Space" ALTER COLUMN "height" SET NOT NULL;
