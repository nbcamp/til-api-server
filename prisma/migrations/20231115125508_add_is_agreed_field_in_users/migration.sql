-- AlterTable
ALTER TABLE `posts` MODIFY `title` VARCHAR(100) NOT NULL;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `is_agreed` BOOLEAN NOT NULL DEFAULT false;
