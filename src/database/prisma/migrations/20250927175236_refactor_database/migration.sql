/*
  Warnings:

  - You are about to drop the column `rating` on the `Recipe` table. All the data in the column will be lost.
  - You are about to drop the column `helpfulCount` on the `Review` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Recipe" DROP COLUMN "rating";

-- AlterTable
ALTER TABLE "Review" DROP COLUMN "helpfulCount";
