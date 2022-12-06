/*
  Warnings:

  - You are about to alter the column `createdAt` on the `account` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.
  - You are about to alter the column `updatedAt` on the `account` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.
  - You are about to alter the column `deletedAt` on the `account` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.
  - You are about to alter the column `lastUsedAt` on the `rt_token` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.
  - You are about to alter the column `deletedAt` on the `rt_token` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.

*/
-- AlterTable
ALTER TABLE `account` MODIFY `createdAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    MODIFY `updatedAt` DATETIME(0) NULL,
    MODIFY `deletedAt` DATETIME(0) NULL;

-- AlterTable
ALTER TABLE `rt_token` MODIFY `lastUsedAt` DATETIME(0) NULL,
    MODIFY `deletedAt` DATETIME(0) NULL;
