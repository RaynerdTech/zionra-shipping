/*
  Warnings:

  - You are about to drop the `CustomerLoginChallenge` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CustomerLoginChallenge" DROP CONSTRAINT "CustomerLoginChallenge_customerId_fkey";

-- DropTable
DROP TABLE "CustomerLoginChallenge";
