/*
  Warnings:

  - You are about to drop the column `group` on the `RecipeIngredient` table. All the data in the column will be lost.
  - You are about to drop the column `note` on the `RecipeIngredient` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "RecipeIngredient" DROP COLUMN "group",
DROP COLUMN "note";
