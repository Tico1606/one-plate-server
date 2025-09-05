/*
  Warnings:

  - The values [ARCHIVED,REJECTED] on the enum `RecipeStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `moderatedById` on the `Recipe` table. All the data in the column will be lost.
  - You are about to drop the column `moderationNotes` on the `Recipe` table. All the data in the column will be lost.
  - You are about to drop the column `nutrition` on the `Recipe` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "RecipeStatus_new" AS ENUM ('DRAFT', 'PUBLISHED');
ALTER TABLE "Recipe" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Recipe" ALTER COLUMN "status" TYPE "RecipeStatus_new" USING ("status"::text::"RecipeStatus_new");
ALTER TYPE "RecipeStatus" RENAME TO "RecipeStatus_old";
ALTER TYPE "RecipeStatus_new" RENAME TO "RecipeStatus";
DROP TYPE "RecipeStatus_old";
ALTER TABLE "Recipe" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;

-- DropForeignKey
ALTER TABLE "Recipe" DROP CONSTRAINT "Recipe_moderatedById_fkey";

-- AlterTable
ALTER TABLE "Recipe" DROP COLUMN "moderatedById",
DROP COLUMN "moderationNotes",
DROP COLUMN "nutrition",
ADD COLUMN     "calories" INTEGER,
ADD COLUMN     "carbGrams" DOUBLE PRECISION,
ADD COLUMN     "fatGrams" DOUBLE PRECISION,
ADD COLUMN     "proteinGrams" DOUBLE PRECISION;
