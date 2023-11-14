/*
  Warnings:

  - A unique constraint covering the columns `[url]` on the table `blogs` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[rss]` on the table `blogs` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `blogs` MODIFY `url` VARCHAR(512) NOT NULL,
    MODIFY `rss` VARCHAR(512) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `blogs_url_key` ON `blogs`(`url`);

-- CreateIndex
CREATE UNIQUE INDEX `blogs_rss_key` ON `blogs`(`rss`);
