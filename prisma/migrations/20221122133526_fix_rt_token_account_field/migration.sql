/*
  Warnings:

  - Made the column `accountId` on table `rt_token` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `rt_token` DROP FOREIGN KEY `rt_token_accountId_fkey`;

-- AlterTable
ALTER TABLE `rt_token` MODIFY `accountId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `rt_token` ADD CONSTRAINT `rt_token_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `account`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
