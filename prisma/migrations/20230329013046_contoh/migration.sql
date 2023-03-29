/*
  Warnings:

  - You are about to drop the column `playerOneId` on the `Game` table. All the data in the column will be lost.
  - You are about to drop the column `playerTwoId` on the `Game` table. All the data in the column will be lost.
  - The `result` column on the `Game` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `GameResult` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `player_one` to the `Game` table without a default value. This is not possible if the table is not empty.
  - Added the required column `player_two` to the `Game` table without a default value. This is not possible if the table is not empty.
  - Added the required column `times` to the `Game` table without a default value. This is not possible if the table is not empty.
  - Added the required column `winner` to the `Game` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Game" DROP CONSTRAINT "Game_playerOneId_fkey";

-- DropForeignKey
ALTER TABLE "Game" DROP CONSTRAINT "Game_playerTwoId_fkey";

-- DropForeignKey
ALTER TABLE "GameResult" DROP CONSTRAINT "GameResult_gameId_fkey";

-- DropForeignKey
ALTER TABLE "GameResult" DROP CONSTRAINT "GameResult_userId_fkey";

-- AlterTable
ALTER TABLE "Game" DROP COLUMN "playerOneId",
DROP COLUMN "playerTwoId",
ADD COLUMN     "player_one" TEXT NOT NULL,
ADD COLUMN     "player_two" TEXT NOT NULL,
ADD COLUMN     "times" TEXT NOT NULL,
ADD COLUMN     "winner" TEXT NOT NULL,
ALTER COLUMN "room" SET DATA TYPE TEXT,
DROP COLUMN "result",
ADD COLUMN     "result" TEXT[];

-- DropTable
DROP TABLE "GameResult";
