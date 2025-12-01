/*
  Warnings:

  - You are about to drop the column `endpoint` on the `PushSubscription` table. All the data in the column will be lost.
  - You are about to drop the column `keys` on the `PushSubscription` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[expoPushToken]` on the table `PushSubscription` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `expoPushToken` to the `PushSubscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `PushSubscription` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "PushSubscription_endpoint_key";

-- AlterTable
ALTER TABLE "PushSubscription" DROP COLUMN "endpoint",
DROP COLUMN "keys",
ADD COLUMN     "deviceInfo" JSONB,
ADD COLUMN     "expoPushToken" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "PushSubscription_expoPushToken_key" ON "PushSubscription"("expoPushToken");
