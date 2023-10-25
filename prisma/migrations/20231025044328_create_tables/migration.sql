-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(20) NULL,
    `avatar_url` TEXT NULL,
    `provider` VARCHAR(10) NULL,
    `provider_id` VARCHAR(100) NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),
    `last_signed_at` TIMESTAMP NULL,
    `deleted_at` TIMESTAMP NULL,

    UNIQUE INDEX `users_provider_provider_id_key`(`provider`, `provider_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `follows` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `follower_id` INTEGER NOT NULL,
    `following_id` INTEGER NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),

    UNIQUE INDEX `follows_follower_id_following_id_key`(`follower_id`, `following_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `blogs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `name` VARCHAR(20) NOT NULL,
    `url` TEXT NOT NULL,
    `rss` TEXT NOT NULL,
    `main` BOOLEAN NOT NULL DEFAULT false,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),

    UNIQUE INDEX `blogs_id_user_id_key`(`id`, `user_id`),
    UNIQUE INDEX `blogs_user_id_name_key`(`user_id`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `posts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `blog_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `content` TEXT NOT NULL,
    `url` VARCHAR(512) NOT NULL,
    `published_at` TIMESTAMP NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),

    UNIQUE INDEX `posts_url_key`(`url`),
    INDEX `publishedAtIndex`(`published_at`),
    UNIQUE INDEX `posts_id_blog_id_key`(`id`, `blog_id`),
    UNIQUE INDEX `posts_id_user_id_key`(`id`, `user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `post_tags` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `post_id` INTEGER NOT NULL,
    `tag` VARCHAR(20) NOT NULL,

    UNIQUE INDEX `post_tags_post_id_tag_key`(`post_id`, `tag`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `keyword_tag_maps` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `blog_id` INTEGER NOT NULL,
    `keyword` VARCHAR(20) NOT NULL,
    `tags` JSON NOT NULL,

    UNIQUE INDEX `keyword_tag_maps_blog_id_keyword_key`(`blog_id`, `keyword`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `follows` ADD CONSTRAINT `follows_follower_id_fkey` FOREIGN KEY (`follower_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `follows` ADD CONSTRAINT `follows_following_id_fkey` FOREIGN KEY (`following_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `blogs` ADD CONSTRAINT `blogs_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `posts` ADD CONSTRAINT `posts_blog_id_fkey` FOREIGN KEY (`blog_id`) REFERENCES `blogs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `posts` ADD CONSTRAINT `posts_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `post_tags` ADD CONSTRAINT `post_tags_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `keyword_tag_maps` ADD CONSTRAINT `keyword_tag_maps_blog_id_fkey` FOREIGN KEY (`blog_id`) REFERENCES `blogs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
