/*
  Warnings:

  - The `exp` column on the `rt_token` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `iat` column on the `rt_token` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE `rt_token` DROP COLUMN `exp`,
    ADD COLUMN `exp` INTEGER NULL,
    DROP COLUMN `iat`,
    ADD COLUMN `iat` INTEGER NULL;
