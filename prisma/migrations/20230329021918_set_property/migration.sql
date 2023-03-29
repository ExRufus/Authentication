/*
  Warnings:

  - You are about to drop the column `player_one` on the `Game` table. All the data in the column will be lost.
  - You are about to drop the column `player_two` on the `Game` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Game" DROP COLUMN "player_one",
DROP COLUMN "player_two",
ADD COLUMN     "playerOne" TEXT,
ADD COLUMN     "playerTwo" TEXT;
