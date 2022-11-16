-- AlterTable
ALTER TABLE `rt_token` ADD COLUMN `browserBrand` VARCHAR(190) NULL,
    ADD COLUMN `ip` VARCHAR(190) NULL,
    ADD COLUMN `platform` VARCHAR(190) NULL,
    ADD COLUMN `userAgent` VARCHAR(190) NULL;
