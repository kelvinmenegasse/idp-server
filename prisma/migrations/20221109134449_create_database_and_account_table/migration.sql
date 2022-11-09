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
