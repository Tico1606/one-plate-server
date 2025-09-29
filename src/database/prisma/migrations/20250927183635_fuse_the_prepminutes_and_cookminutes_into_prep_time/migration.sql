/*
  Warnings:

  - You are about to drop the column `cookMinutes` on the `Recipe` table. All the data in the column will be lost.
  - You are about to drop the column `prepMinutes` on the `Recipe` table. All the data in the column will be lost.
  - Added the required column `prepTime` to the `Recipe` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Recipe" DROP COLUMN "cookMinutes",
DROP COLUMN "prepMinutes",
ADD COLUMN     "prepTime" INTEGER NOT NULL;
