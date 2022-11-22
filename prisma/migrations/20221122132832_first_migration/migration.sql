-- CreateTable
CREATE TABLE `account` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(190) NOT NULL,
    `email` VARCHAR(190) NULL,
    `cpf` VARCHAR(50) NULL,
    `username` VARCHAR(190) NOT NULL,
    `password` VARCHAR(60) NOT NULL,
    `recoveryKey` VARCHAR(60) NULL,
    `registerStatus` VARCHAR(190) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `account_cpf_key`(`cpf`),
    UNIQUE INDEX `account_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rt_token` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `accountId` INTEGER NULL,
    `hashedRt` VARCHAR(190) NOT NULL,
    `exp` DATETIME(3) NOT NULL,
    `iat` DATETIME(3) NOT NULL,
    `ip` VARCHAR(190) NULL,
    `platform` VARCHAR(190) NULL,
    `browserBrand` VARCHAR(190) NULL,
    `userAgent` VARCHAR(190) NULL,
    `registerStatus` VARCHAR(190) NOT NULL,
    `lastUsedAt` DATETIME(3) NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `rt_token` ADD CONSTRAINT `rt_token_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `account`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
