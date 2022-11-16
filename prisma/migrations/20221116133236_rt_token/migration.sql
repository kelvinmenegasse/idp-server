-- CreateTable
CREATE TABLE `rt_token` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `accountId` INTEGER NOT NULL,
    `hashedRt` VARCHAR(190) NOT NULL,
    `exp` DATETIME(3) NOT NULL,
    `iat` DATETIME(3) NOT NULL,
    `aud` VARCHAR(190) NULL,
    `registerStatus` VARCHAR(190) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `rt_token` ADD CONSTRAINT `rt_token_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `account`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
