-- YollerDB
--
-- WARNING: Running this MySQL file will erase your current schema (if it exists) and all the data inside it!
-- Please only use this script to create a new, empty database. Database updates will be applied
-- automatically without running this file.

DROP SCHEMA IF EXISTS `iliumdb`;

CREATE DATABASE `iliumdb`;

USE `iliumdb`;

-- 0.4.0

DROP TABLE IF EXISTS `db_info`;

CREATE TABLE `db_info` (
   `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
   `key` varchar(255) NOT NULL,
   `value` varchar(255) NOT NULL,
   PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `user`;

CREATE TABLE `user` (
	`id` int unsigned NOT NULL AUTO_INCREMENT,
	`profile_photo_id` int unsigned,
	`created` timestamp DEFAULT CURRENT_TIMESTAMP,
   `updated` timestamp ON UPDATE CURRENT_TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	`handle` varchar(20) NOT NULL,
	`email` varchar(100) NOT NULL,
	`registered` tinyint(1) NOT NULL DEFAULT 0,
   `verified` tinyint(1) NOT NULL DEFAULT 0,
	PRIMARY KEY (`id`),
	UNIQUE INDEX (`handle`),
	UNIQUE INDEX (`email`),
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `user_login`;

CREATE TABLE `user_login` (
	`id` int unsigned NOT NULL AUTO_INCREMENT,
	`user_id` int unsigned NOT NULL,
	`timestamp` timestamp DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`),
	CONSTRAINT FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO `db_info` (`key`, `value`) VALUES ('framework_version', '0.0.1');