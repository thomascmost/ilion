-- YollerDB
--
-- WARNING: Running this MySQL file will erase your current schema (if it exists) and all the data inside it!
-- Please only use this script to create a new, empty database. Database updates will be applied
-- automatically without running this file.

DROP SCHEMA IF EXISTS `iliondb`;

CREATE DATABASE `iliondb`;

USE `iliondb`;

-- 0.4.0

DROP TABLE IF EXISTS `db_info`;

CREATE TABLE `db_info` (
   `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
   `key` varchar(255) NOT NULL,
   `value` varchar(255) NOT NULL,
   PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `active`;

CREATE TABLE `active` (
	`id` int unsigned NOT NULL AUTO_INCREMENT,
	`user_id` int unsigned DEFAULT NULL,
	`group_id` int unsigned DEFAULT NULL,
	`alias` VARCHAR(175) NOT NULL,
	PRIMARY KEY (`id`),
	INDEX (`alias`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `photo`;

CREATE TABLE `photo` (
	`id` int unsigned NOT NULL AUTO_INCREMENT,
	`blob_id` int unsigned NOT NULL,
	`height` int unsigned NOT NULL,
	`width` int unsigned NOT NULL,
	PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `user`;

CREATE TABLE `user` (
	`id` int unsigned NOT NULL AUTO_INCREMENT,
	`active_id` int unsigned,
	`profile_photo_id` int unsigned,
	`cover_photo_id` int unsigned,
	`created` timestamp DEFAULT CURRENT_TIMESTAMP,
	`handle` varchar(20) NOT NULL,
	`email` varchar(100) NOT NULL,
	`email_notifications` tinyint(1) NOT NULL DEFAULT 0,
	`phone` varchar(12) DEFAULT NULL,
	`phone_notifications` tinyint(1) NOT NULL DEFAULT 0,
	`registered` tinyint(1) NOT NULL DEFAULT 0,
	`portfolio_html` TEXT NOT NULL,
	PRIMARY KEY (`id`),
	UNIQUE INDEX (`handle`),
	UNIQUE INDEX (`email`),
	CONSTRAINT FOREIGN KEY (`active_id`) REFERENCES `active` (`id`) ON UPDATE CASCADE ON DELETE SET NULL,
	CONSTRAINT FOREIGN KEY (`profile_photo_id`) REFERENCES `photo` (`id`) ON UPDATE CASCADE ON DELETE SET NULL,
	CONSTRAINT FOREIGN KEY (`cover_photo_id`) REFERENCES `photo` (`id`) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `user_photo`;

CREATE TABLE `user_photo` (
	`id` int unsigned NOT NULL AUTO_INCREMENT,
	`user_id` int unsigned NOT NULL,
	`photo_id` int unsigned NOT NULL,
	PRIMARY KEY (`id`),
	CONSTRAINT FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON UPDATE CASCADE ON DELETE CASCADE,
	CONSTRAINT FOREIGN KEY (`photo_id`) REFERENCES `photo` (`id`) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `user_message`;

CREATE TABLE `user_message` (
	`id` int unsigned NOT NULL AUTO_INCREMENT,
	`user_id` int unsigned NOT NULL,
	`message` text NOT NULL,
	PRIMARY KEY (`id`),
	CONSTRAINT FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `user_login`;

CREATE TABLE `user_login` (
	`id` int unsigned NOT NULL AUTO_INCREMENT,
	`user_id` int unsigned NOT NULL,
	`timestamp` timestamp DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`),
	CONSTRAINT FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `group`;

CREATE TABLE `group` (
	`id` int unsigned NOT NULL AUTO_INCREMENT,
	`active_id` int unsigned,
	`owner_id` int unsigned,
	`created` timestamp DEFAULT CURRENT_TIMESTAMP,
	`open_to_requests` tinyint(1) NOT NULL DEFAULT 1,
	PRIMARY KEY (`id`),
	CONSTRAINT FOREIGN KEY (`active_id`) REFERENCES `active` (`id`) ON UPDATE CASCADE ON DELETE SET NULL,
	CONSTRAINT FOREIGN KEY (`owner_id`) REFERENCES `user` (`id`) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `group_admin`;

CREATE TABLE `group_admin` (
	`id` int unsigned NOT NULL AUTO_INCREMENT,
	`group_id` int unsigned NOT NULL,
	`user_id` int unsigned NOT NULL,
	PRIMARY KEY (`id`),
	CONSTRAINT FOREIGN KEY (`group_id`) REFERENCES `group` (`id`) ON UPDATE CASCADE ON DELETE CASCADE,
	CONSTRAINT FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

ALTER TABLE `active`
	ADD CONSTRAINT FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON UPDATE CASCADE ON DELETE CASCADE,
	ADD CONSTRAINT FOREIGN KEY (`group_id`) REFERENCES `group` (`id`) ON UPDATE CASCADE ON DELETE CASCADE;

DROP TABLE IF EXISTS `user_group_membership`;

CREATE TABLE `user_group_membership` (
	`id` int unsigned NOT NULL AUTO_INCREMENT,
	`user_id` int unsigned NOT NULL,
	`group_id` int unsigned NOT NULL,
	`label` varchar(50) NOT NULL,
	`start_time` timestamp DEFAULT CURRENT_TIMESTAMP,
	`end_time` timestamp NULL DEFAULT NULL,
	`confirmed` tinyint(1) NOT NULL DEFAULT 0,
	PRIMARY KEY (`id`),
	CONSTRAINT FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON UPDATE CASCADE ON DELETE CASCADE,
	CONSTRAINT FOREIGN KEY (`group_id`) REFERENCES `group` (`id`) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `active_follower`;

CREATE TABLE `active_follower` (
	`id` int unsigned NOT NULL AUTO_INCREMENT,
	`active_id` int unsigned NOT NULL,
	`follower_id` int unsigned NOT NULL,
	`notifications` tinyint(1) unsigned NOT NULL DEFAULT 0,
	PRIMARY KEY (`id`),
	CONSTRAINT FOREIGN KEY (`active_id`) REFERENCES `active` (`id`) ON UPDATE CASCADE ON DELETE CASCADE,
	CONSTRAINT FOREIGN KEY (`follower_id`) REFERENCES `user` (`id`) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `yoller`;

CREATE TABLE `yoller` (
	`id` int unsigned NOT NULL AUTO_INCREMENT,
	`name` varchar(175) NOT NULL,
	`tagline` varchar(255) NOT NULL,
	`description` TEXT NOT NULL,
	`created` timestamp DEFAULT CURRENT_TIMESTAMP,
	`profile_photo_id` int unsigned,
	`cover_photo_id` int unsigned,
	-- TODO 5.6: `last_updated` timestamp ON UPDATE CURRENT_TIMESTAMP DEFAULT CURRENT_TIMESTAMP ,
	`owner_id` int unsigned, -- can be null if user is deleted!
	`source_yoller_id` int unsigned DEFAULT NULL,
	`parent_yoller_id` int unsigned DEFAULT NULL,
	`collabs_can_edit` tinyint(1) NOT NULL DEFAULT 0,
	PRIMARY KEY (`id`),
	CONSTRAINT FOREIGN KEY (`owner_id`) REFERENCES `user` (`id`) ON UPDATE CASCADE ON DELETE SET NULL,
	CONSTRAINT FOREIGN KEY (`source_yoller_id`) REFERENCES `yoller` (`id`) ON UPDATE CASCADE ON DELETE SET NULL,
	CONSTRAINT FOREIGN KEY (`parent_yoller_id`) REFERENCES `yoller` (`id`) ON UPDATE CASCADE ON DELETE SET NULL,
	CONSTRAINT FOREIGN KEY (`profile_photo_id`) REFERENCES `photo` (`id`) ON UPDATE CASCADE ON DELETE SET NULL,
	CONSTRAINT FOREIGN KEY (`cover_photo_id`) REFERENCES `photo` (`id`) ON UPDATE CASCADE ON DELETE SET NULL
    -- , TODO 5.6: FULLTEXT `name_description` (`name`, `description`, `tagline`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `yoller_photo`;

CREATE TABLE `yoller_photo` (
	`id` int unsigned NOT NULL AUTO_INCREMENT,
	`yoller_id` int unsigned NOT NULL,
	`photo_id` int unsigned NOT NULL,
	PRIMARY KEY (`id`),
	CONSTRAINT FOREIGN KEY (`yoller_id`) REFERENCES `yoller` (`id`) ON UPDATE CASCADE ON DELETE CASCADE,
	CONSTRAINT FOREIGN KEY (`photo_id`) REFERENCES `photo` (`id`) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `yoller_admin`;

CREATE TABLE `yoller_admin` (
	`id` int unsigned NOT NULL AUTO_INCREMENT,
	`yoller_id` int unsigned NOT NULL,
	`user_id` int unsigned NOT NULL,
	PRIMARY KEY (`id`),
	CONSTRAINT FOREIGN KEY (`yoller_id`) REFERENCES `yoller` (`id`) ON UPDATE CASCADE ON DELETE CASCADE,
	CONSTRAINT FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `yoller_parent_request`;

CREATE TABLE `yoller_parent_request` (
	`id` int unsigned NOT NULL AUTO_INCREMENT,
	`parent_yoller_id` int unsigned NOT NULL,
	`yoller_id` int unsigned NOT NULL,
	PRIMARY KEY (`id`),
	CONSTRAINT FOREIGN KEY (`parent_yoller_id`) REFERENCES `yoller` (`id`) ON UPDATE CASCADE ON DELETE CASCADE,
	CONSTRAINT FOREIGN KEY (`yoller_id`) REFERENCES `yoller` (`id`) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `yoller_occurrence`;

CREATE TABLE `yoller_occurrence` (
	`id` int unsigned NOT NULL AUTO_INCREMENT,
	`yoller_id` int unsigned NOT NULL,
	`timestamp` timestamp,
	`latitude` int unsigned NOT NULL,
	`longitude` int unsigned NOT NULL,
	`friendly_location` text NOT NULL,
	PRIMARY KEY (`id`),
	INDEX (`latitude`),
	INDEX (`longitude`),
	INDEX (`timestamp`),
	CONSTRAINT FOREIGN KEY (`yoller_id`) REFERENCES `yoller` (`id`) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `yoller_group_tag`;

CREATE TABLE `yoller_group_tag` (
	`id` int unsigned NOT NULL AUTO_INCREMENT,
	`yoller_id` int unsigned NOT NULL,
	`group_id` int unsigned NOT NULL,
	PRIMARY KEY (`id`),
	CONSTRAINT FOREIGN KEY (`yoller_id`) REFERENCES `yoller` (`id`) ON UPDATE CASCADE ON DELETE CASCADE,
	CONSTRAINT FOREIGN KEY (`group_id`) REFERENCES `group` (`id`) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `yoller_occurrence_rsvp`;

CREATE TABLE `yoller_occurrence_rsvp` (
	`id` int unsigned NOT NULL AUTO_INCREMENT,
	`yoller_occurrence_id` int unsigned NOT NULL,
	`user_id` int unsigned NOT NULL,
	PRIMARY KEY (`id`),
	CONSTRAINT FOREIGN KEY (`yoller_occurrence_id`) REFERENCES `yoller_occurrence` (`id`) ON UPDATE CASCADE ON DELETE CASCADE,
	CONSTRAINT FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `yoller_section`;

CREATE TABLE `yoller_section` (
	`id` int unsigned NOT NULL AUTO_INCREMENT,
	`yoller_id` int unsigned NOT NULL,
	`name` varchar(50) NOT NULL,
	`order` int unsigned NOT NULL DEFAULT 0,
	`yoller_occurrence_id` int unsigned DEFAULT NULL, -- USED TO LINK SECTION TO PARTICULAR OCCURRENCE
	PRIMARY KEY (`id`),
	CONSTRAINT FOREIGN KEY (`yoller_id`) REFERENCES `yoller` (`id`) ON UPDATE CASCADE ON DELETE CASCADE,
	CONSTRAINT FOREIGN KEY (`yoller_occurrence_id`) REFERENCES `yoller_occurrence` (`id`) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `role`;

CREATE TABLE `role` (
	`id` int unsigned NOT NULL AUTO_INCREMENT,
	`name` varchar(50) NOT NULL,
	`parent_role_id` int unsigned, -- can be null if top-level role
	PRIMARY KEY (`id`),
	CONSTRAINT FOREIGN KEY (`parent_role_id`) REFERENCES `role` (`id`) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `custom_role`;

CREATE TABLE `custom_role` (
	`id` int unsigned NOT NULL AUTO_INCREMENT,
	`name` varchar(50) NOT NULL,
	`parent_role_id` int unsigned,
	PRIMARY KEY (`id`),
	CONSTRAINT FOREIGN KEY (`parent_role_id`) REFERENCES `role` (`id`) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `section_active_role`;

CREATE TABLE `section_active_role` (
	`id` int unsigned NOT NULL AUTO_INCREMENT,
	`yoller_section_id` int unsigned NOT NULL,
	`active_id` int unsigned NOT NULL,
	`role_id` int unsigned, -- can be null
	`custom_role_id` int unsigned, -- can be null
	`order` int unsigned NOT NULL DEFAULT 0,
	PRIMARY KEY (`id`),
	CONSTRAINT FOREIGN KEY (`yoller_section_id`) REFERENCES `yoller_section` (`id`) ON UPDATE CASCADE ON DELETE CASCADE,
	CONSTRAINT FOREIGN KEY (`active_id`) REFERENCES `active` (`id`) ON UPDATE CASCADE ON DELETE CASCADE,
	CONSTRAINT FOREIGN KEY (`role_id`) REFERENCES `role` (`id`) ON UPDATE CASCADE ON DELETE SET NULL,
	CONSTRAINT FOREIGN KEY (`custom_role_id`) REFERENCES `custom_role` (`id`) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `sent_email`;

CREATE TABLE `sent_email` (
	`id` int unsigned NOT NULL AUTO_INCREMENT,
	`user_id` int unsigned,
	`subject` varchar(256) NOT NULL,
	`body` text NOT NULL,
	`timestamp` timestamp DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`),
	CONSTRAINT FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `sent_text`;

CREATE TABLE `sent_text` (
	`id` int unsigned NOT NULL AUTO_INCREMENT,
	`user_id` int unsigned,
	`message` varchar(160),
	`timestamp` timestamp DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`),
	CONSTRAINT FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 0.4.1

ALTER TABLE `active` ADD COLUMN `enabled` tinyint(1) NOT NULL DEFAULT 1;
ALTER TABLE `user_login` ADD COLUMN `successful` tinyint(1) NOT NULL DEFAULT 0;
ALTER TABLE `yoller` CHANGE `name` `title` varchar(175) NOT NULL;
CREATE TABLE `yoller_type` ( `id` int unsigned NOT NULL AUTO_INCREMENT, `name` varchar(50) NOT NULL, PRIMARY KEY (`id`) ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
ALTER TABLE `yoller` ADD COLUMN `type_id` int unsigned DEFAULT NULL;
ALTER TABLE `yoller` ADD CONSTRAINT FOREIGN KEY (`type_id`) REFERENCES `yoller_type` (`id`) ON UPDATE CASCADE ON DELETE SET NULL;

-- 0.4.2

RENAME TABLE `yoller_parent_request` TO `umbrella_yoller_request`;
ALTER TABLE `umbrella_yoller_request` DROP FOREIGN KEY `umbrella_yoller_request_ibfk_1`;
ALTER TABLE `umbrella_yoller_request` CHANGE `parent_yoller_id` `umbrella_yoller_id` int unsigned DEFAULT NULL;
ALTER TABLE `umbrella_yoller_request` ADD CONSTRAINT FOREIGN KEY (`umbrella_yoller_id`) REFERENCES `yoller`(`id`) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE `yoller` DROP FOREIGN KEY `yoller_ibfk_3`;
ALTER TABLE `yoller` CHANGE `parent_yoller_id` `umbrella_yoller_id` int unsigned DEFAULT NULL;
ALTER TABLE `yoller` ADD CONSTRAINT FOREIGN KEY (`umbrella_yoller_id`) REFERENCES `yoller`(`id`);

-- 0.4.3

ALTER TABLE `yoller_occurrence` CHANGE `latitude` `latitude` varchar(50) NOT NULL DEFAULT '0';
ALTER TABLE `yoller_occurrence` CHANGE `longitude` `longitude` varchar(50) NOT NULL DEFAULT '0';
ALTER TABLE `yoller_occurrence` CHANGE `friendly_location` `friendly_location` varchar(50) NOT NULL DEFAULT '';
ALTER TABLE `yoller_occurrence` ADD COLUMN `price` text DEFAULT NULL;

-- 0.4.4

INSERT INTO `yoller_type` (`name`) VALUES ('Play'), ('Gig'), ('Party'), ('Stand-up Show'), ('Video'), ('Play Script'), ('Gallery');

-- 0.4.5

INSERT INTO `role` (`id`, `name`, `parent_role_id`) VALUES (1, 'Actor', NULL), (2, 'Writer', NULL), (3, 'Playwright', 2), (4, 'Adaptation', 2), (5, 'Director', NULL), (6, 'Assistant Director', 5), (7, 'Artist', NULL), (8, 'Painter', 7), (9, 'Illustrator', 7), (10, 'Inks', 7), (11, 'Pencils', 7), (12, 'Comedian', NULL), (13, 'Headliner', 12), (14, 'Opener', 12), (15, 'Musician', NULL), (16, 'Drummer', 15), (17, 'Guitarist', 15), (18, 'Bassist', 15), (19, 'Pianist', 15), (20, 'Horn Blower', 15), (21, 'Saxophonist', 15), (22, 'Trumpeter', 15), (23, 'Flutist', 15), (24, 'Clarinetist', 15), (25, 'Vocalist', 15), (26, 'Singer', 25), (27, 'Soprano', 25), (28, 'Mezzo-soprano', 25), (29, 'Contralto', 25), (30, 'Countertenor', 25), (31, 'Tenor', 25), (32, 'Baritone', 25), (33, 'Bass', 25), (34, 'Treble', 25);

-- 0.4.6

ALTER TABLE `role` CHANGE `name` `label` varchar(50) NOT NULL;
ALTER TABLE `yoller_type` CHANGE `name` `label` varchar(50) NOT NULL;
ALTER TABLE `user` ADD COLUMN `password` binary(20) NOT NULL;
ALTER TABLE `user` ADD COLUMN `salt` char(10) NOT NULL;

-- 0.4.7

ALTER TABLE `user` CHANGE `handle` `handle` varchar(20);

-- 0.4.8

ALTER TABLE `user` ADD COLUMN `bio` varchar(150) NOT NULL DEFAULT '';

-- 0.4.9

ALTER TABLE `active` ADD COLUMN `created` timestamp DEFAULT current_timestamp;

-- 0.5.0

ALTER TABLE `yoller_type` ADD COLUMN `plural` varchar(50) NOT NULL;
UPDATE `yoller_type` SET `plural`='Plays' WHERE `label`='Play';
UPDATE `yoller_type` SET `plural`='Gigs' WHERE `label`='Gig';
UPDATE `yoller_type` SET `plural`='Parties' WHERE `label`='Party';
UPDATE `yoller_type` SET `plural`='Stand-up' WHERE `label`='Stand-up Show';
UPDATE `yoller_type` SET `plural`='Videos' WHERE `label`='Video';
UPDATE `yoller_type` SET `plural`='Play Scripts' WHERE `label`='Play Script';
UPDATE `yoller_type` SET `plural`='Galleries' WHERE `label`='Gallery';

DROP PROCEDURE IF EXISTS `createUsers`;
DROP PROCEDURE IF EXISTS `createYollers`;
DROP PROCEDURE IF EXISTS `createYollerSection`;
DROP PROCEDURE IF EXISTS `createYollerCollab`;
DROP PROCEDURE IF EXISTS `createYollerOccurrence`;
DROP FUNCTION IF EXISTS randWord;
DROP FUNCTION IF EXISTS randNumber;
DROP FUNCTION IF EXISTS phoneNumber;
DROP FUNCTION IF EXISTS firstName;
DROP FUNCTION IF EXISTS lastName;

DELIMITER //
CREATE PROCEDURE `createUsers` (IN numUsers INT)
BEGIN
	DECLARE fName, lName, uEmail varchar(100);
	DECLARE uHandle varchar(20);
	DECLARE uSalt char(10);
	DECLARE userID, activeID INT;
	WHILE numUsers > 0 DO
		SET fName = firstName();
		SET lName = lastName();
		SET uHandle = LEFT(CONCAT(fName, LEFT(UUID(),8)), 20);
		SET uEmail = CONCAT(LEFT(CONCAT(fName,'_', lName), 80), '@', randWord(10), '.com');
		SET uSalt = randWord(10);
		INSERT INTO `user` (active_id, profile_photo_id, created, handle, email, email_notifications, phone, phone_notifications, registered, portfolio_html, password, salt, bio) VALUES
			(NULL, NULL, CURRENT_TIMESTAMP, uHandle, uEmail, floor(rand() * 10) % 2, phoneNumber(), floor(rand() * 10) % 2, 1, '', UNHEX(SHA1(CONCAT(uHandle,uSalt))), uSalt, CONCAT('Hello! I am ',fName,' ',lName,'.'));
		SET userID = LAST_INSERT_ID();
		INSERT INTO `active` (user_id, group_id, alias, enabled, created) VALUES (userID, NULL, CONCAT(fName,' ',lName), 1, CURRENT_TIMESTAMP);
		SET activeID = LAST_INSERT_ID();
		UPDATE `user` SET `active_id`=activeID WHERE `id`=userID;
		SET numUsers = numUsers - 1;
	END WHILE;
END //

DELIMITER //
CREATE PROCEDURE `createYollers` (IN numYollers INT)
BEGIN
	DECLARE ownerID, yollerTypeID, yollerID, numSections, numOccurrences INT;
	DECLARE ownerName, yollerType varchar(100);
	WHILE numYollers > 0 DO
		SELECT `id` INTO ownerID FROM user ORDER BY RAND() LIMIT 1;
		SELECT `alias` INTO ownerName FROM `active` WHERE `user_id`=ownerID;
		SELECT `id`, `label` INTO yollerTypeID, yollerType FROM `yoller_type` ORDER BY RAND() LIMIT 1;
		INSERT INTO `yoller` (title, type_id, tagline, description, created, profile_photo_id, cover_photo_id, owner_id, source_yoller_id, umbrella_yoller_id, collabs_can_edit) VALUES
			(CONCAT(ownerName,"'s ",yollerType),yollerTypeID,CONCAT("My ", yollerType,' is going to be great.'), '', CURRENT_TIMESTAMP, NULL, NULL, ownerID, NULL, NULL, 1);
		SET yollerID = LAST_INSERT_ID();
		SET numSections = randNumber(2,6);
		WHILE numSections > 0 DO
			CALL createYollerSection(yollerID, numSections);
			SET numSections = numSections - 1;
		END WHILE;
		SET numOccurrences = randNumber(1, 4);
		WHILE numOccurrences > 0 DO
			CALL createYollerOccurrence(yollerID);
			SET numOccurrences = numOccurrences - 1;
		END WHILE;
		SET numYollers = numYollers - 1;
	END WHILE;
END //

DELIMITER //
CREATE PROCEDURE `createYollerOccurrence` (IN yollerID INT)
BEGIN
	SET @dumbTimeStamp := FROM_UNIXTIME(UNIX_TIMESTAMP(CURRENT_TIMESTAMP) + FLOOR(0 + RAND()*6307200));
	INSERT INTO `yoller_occurrence` (yoller_id, timestamp, latitude, longitude, local_time, friendly_location, price) VALUES
		(yollerID, @dumbTimeStamp, "0.0000", "0.0000", @dumbTimeStamp,
		ELT(0.5 + RAND()*253,
			"Invergordon","Molesey","Bourne End","Johnstone","Well","Gorebridge","Currie","Limavady","Banbridge","Hendon","Mold","Oswaldtwistle","Renfrew","Coatbridge","Newport Pagnell","Chessington","Eastwood","Abergele","Kenley","Otford","Kirkintilloch","Syston","Frodsham","Haydock","Bridgemary","Manningtree","Frinton-on-Sea","Portchester","Leigh","Nelson","Royston","Betchworth","Cobham","Hungerford","Hillingdon","Hanwell","Calverton","Eastington","Egremont","Tweedmouth","Ponteland","Rothbury","Countess Wear","Maryport","Barton upon Humber","Beccles","Warlingham","Chislehurst","Askam in Furness","Gillingham","Richmond","Halewood","Blairgowrie","Cupar","Thurso","Kinghorn","Ruthin","Crickhowell","Oundle","Somersham","Sherborne","Caersws","Brackley","Great Gransden","Airdrie","Clovenfords","Stromness","Gosberton","Biddenden","Roydon","Knaresborough","Shepton Mallet","Helensburgh","Bolney","Curdridge","Llandeilo","Tenterden","Fakenham","Aberaeron","Market Drayton","Holyhead","Clun","Wigton","Bowes","Brecon","Neston","Treforest","River","Granby","Melbourne","Arnold","Meldreth","Hessle","Beverley","North Ferriby","Cottingham","Anlaby","Elloughton","Hillside","Hursley","Newton Stewart","Carlton","Pickering","Bedale","Thornton-in-Craven","Settle","Manor","Fauldhouse","Sleaford","Duffield","Monmouth","Coupar Angus","Wick","Chipstead","West Kirby","Magheralin","Alnwick","Haverfordwest","Holmewood","Winslow","Ampthill","Hillsborough","Dunmurry","Thirsk","East Hagbourne","Rhayader","Newport","Abberton","Sandwich","Much Wenlock","Laugharne","Clunderwen","Churchill","Finchampstead","Godstone","Howden","Stanford","Tregarth","Pembroke Dock","Newtown","Ely","Rye","New Romney","Coulsdon","Dorking","Newham","Cliffe","Goring","Molesey","Hampton","Pewsey","Marlborough","Croston","Elland","Pocklington","Witney","Padbury","Radstock","Holt","Alva","Gourock","Greenock","Stanwell","Craven Arms","Bucknell","Ferryside","Treharris","Lampeter","Lauder","Malton","Crowland","Whittlesey","Llanfyrnach","Weston","Budleigh Salterton","Ashington","Llanishen","Battle","Minehead","Liphook","Chertsey","Ingatestone","Brasted","Headley","Arundel","Axbridge","Amlwch","Hawick","Alness","Auchinleck","Anstruther","Cross","Ballycastle","Portrush","Woodhall Spa","Southwold","Totternhoe","Wantage","Walmer","Falmouth","Milnathort","Skipton","Great Dunmow","Brechin","Birtley","Bildeston","Papworth Everard","Wrangaton","Fordingbridge","Bagshot","Earley","Bolsover","Bromyard","Stokesley","Tillicoultry","Haddington","Armadale","Romsey","Draycott","Sedbergh","Otley","Meanwood","Market Rasen","East Boldon","Workington","Llandovery","Rutherglen","Peebles","Horwich","Ballyclare","Buckingham","Purley","Kings Sutton","Okehampton","Stone Allerton","Yelverton","Blackford","Wedmore","Ashtead","Hill","Omagh","Barnard Castle","Appleby","Frithville","Caythorpe","Swaffham","Milnthorpe","Kelso","Shinfield","Swinton","Buntingford","Holbeach","Sunningdale"	)
		, CONCAT("$",randNumber(1,150),".50"));
END //

DELIMITER //
CREATE PROCEDURE `createYollerSection` (IN yollerID INT, IN sectionNum INT)
BEGIN
	DECLARE ysName varchar(100);
	DECLARE numCollabs, ysID INT;
	SET ysName = ELT(0.5 + RAND() * 10, 'Cast', 'People Who Did Things', 'Extras', 'Undesirables', 'Desirables', 'Those Who Watched', 'Special Thanks To', 'People Who Might Have Done Something', 'Offsite Help', 'Others');
	INSERT INTO `yoller_section` (yoller_id, `name`, `order`, yoller_occurrence_id) VALUES (yollerID, ysName, sectionNum, NULL);
	SET ysID = LAST_INSERT_ID();
	SET numCollabs = randNumber(2, 14);
	WHILE numCollabs > 0 DO
		CALL createYollerCollab(ysID, numCollabs);
		SET numCollabs = numCollabs - 1;
	END WHILE;
END //

DELIMITER //
CREATE PROCEDURE `createYollerCollab` (IN ysID INT, IN collabNum INT)
BEGIN
	INSERT INTO `section_active_role` (yoller_section_id, active_id, role_id, custom_role_id, `order`) VALUES
		(ysID,
			(SELECT `id` FROM `active` ORDER BY RAND() LIMIT 1),
			(SELECT `id` FROM `role` ORDER BY RAND() LIMIT 1), NULL, collabNum);
END //

DELIMITER //
CREATE FUNCTION `randWord` (length INT) RETURNS varchar(100) NOT DETERMINISTIC
BEGIN
	DECLARE word varchar(100);
	DECLARE addLength INT;
	SET word = '';
	WHILE length > 0 DO
		IF length > 8 THEN SET addLength = 8;
		ELSE SET addLength = length;
		END IF;
		SET length = length - 8;
		SET word = CONCAT(word, LEFT(UUID(), addLength));
	END WHILE;
	RETURN word;
END //

DELIMITER //
CREATE FUNCTION `phoneNumber` () RETURNS char(12) NOT DETERMINISTIC
BEGIN
	RETURN CONCAT('+1', randNumber(10000,99999), randNumber(10000,99999));
END //

DELIMITER //
CREATE FUNCTION `randNumber` (min INT, max INT) RETURNS INT NOT DETERMINISTIC
BEGIN
	RETURN ROUND(RAND()*(max-min)+min);
END //

DELIMITER //
CREATE FUNCTION `firstName` () RETURNS varchar(100) NOT DETERMINISTIC
BEGIN
	DECLARE word varchar(100);
	SET word = ELT(0.5 + RAND() * 4874, 'David','John','Paul','Mark','James','Andrew','Scott','Steven','Robert','Stephen','William','Craig','Michael','Stuart','Christopher','Alan','Colin','Brian','Kevin','Gary','Richard','Derek','Martin','Thomas','Neil','Barry','Ian','Jason','Iain','Gordon','Alexander','Graeme','Peter','Darren','Graham','George','Kenneth','Allan','Simon','Douglas','Keith','Lee','Anthony','Grant','Ross','Jonathan','Gavin','Nicholas','Joseph','Stewart','Daniel','Edward','Matthew','Donald','Fraser','Garry','Malcolm','Charles','Duncan','Alistair','Raymond','Philip','Ronald','Ewan','Ryan','Francis','Bruce','Patrick','Alastair','Bryan','Marc','Jamie','Hugh','Euan','Gerard','Sean','Wayne','Adam','Calum','Alasdair','Robin','Greig','Angus','Russell','Cameron','Roderick','Norman','Murray','Gareth','Dean','Eric','Adrian','Gregor','Samuel','Gerald','Henry','Justin','Benjamin','Shaun','Callum','Campbell','Frank','Roy','Timothy','Glen','Marcus','Hamish','Niall','Barrie','Liam','Brendan','Terence','Greg','Leslie','Lindsay','Trevor','Vincent','Christian','Lewis','Rory','Antony','Fergus','Roger','Arthur','Dominic','Ewen','Jon','Owen','Gregory','Jeffrey','Terry','Damian','Geoffrey','Harry','Walter','Bernard','Desmond','Jack','Aaron','Archibald','Blair','Jeremy','Nathan','Alister','Dale','Dylan','Glenn','Julian','Leon','Allen','Martyn','Nigel','Alisdair','Denis','Drew','Evan','Phillip','Frazer','Guy','Laurence','Lawrence','Magnus','Crawford','Finlay','Frederick','Gregg','Karl','Kerr','Mohammed','Rodney','Victor','Carl','Daryl','Don','Edwin','Erik','Grahame','Ivan','Kyle','Leigh','Lorne','Maurice','Murdo','Nicolas','Steve','Allister','Clark','Darran','Dennis','Elliot','Leonard','Nairn','Scot','Stefan','Toby','Warren','Billy','Clive','Damien','Louis','Mohammad','Neill','Noel','Ralph','Sandy','Albert','Alun','Brett','Clifford','Eoin','Glyn','Imran','Ivor','Johnathan','Kevan','Neal','Oliver','Robbie','Roland','Stanley','Aidan','Antonio','Austin','Bradley','Cornelius','Darrin','Derrick','Innes','Kristian','Lachlan','Mathew','Moray','Nicol','Shane','Tony','Brent','Findlay','Forbes','Gilbert','Giles','Jay','Kelvin','Leighton','Marco','Omar','Roddy','Tom','Abdul','Alfred','Alick','Ashley','Bryce','Conrad','Darryl','Eugene','Harold','Harvey','Hector','Jody','Kieran','Kirk','Kris','Marshall','Muhammad','Ramsay','Ray','Rodger','Seumas','Tommy','Wai','Alex','Ali','Andrea','Archie','Daren','Derick','Gideon','Jan','Juan','Kerry','Kieron','Luke','Lyall','Manus','Marvin','Morgan','Muir','Myles','Ronnie','Rowan','Rupert','Spencer','Stephan','Struan','Torquil','Wallace','Aftab','Alain','Alec','Alvin','Anton','Arran','Arron','Austen','Aynsley','Benedict','Chad','Chun','Clarke','Damon','Danny','Darron','Declan','Deryck','Edmond','Edmund','Jacob','Johnston','Keiron','Kennedy','Khalil','Kristofer','Laurie','Lloyd','Mario','Max','Maxwell','Mitchell','Morris','Nathaniel','Naveed','Neville','Nickolas','Piers','Quentin','Rennie','Reuben','Riccardo','Roberto','Ruaraidh','Ruaridh','Stefano','Symon','Tobias','Todd','Abid','Adnan','Aeneas','Aiden','Ainslie','Ajay','Alessandro','Alyn','Anderson','Andre','Ashok','Asif','Atholl','Bjorn','Brandon','Brydon','Bryn','Caine','Calvin','Carlo','Ceri','Chris','Christien','Claudio','Clayton','Clint','Connell','Cyril','Damion','Darin','Dario','Darroch','Deryk','Dirk','Donovan','Dustin','Eamonn','Edgar','Elliott','Elton','Emlyn','Eoghan','Erlend','Farooq','Garth','Geoff','Gerrard','Gerry','Giancarlo','Gidon','Grierson','Hamilton','Hans','Hendry','Howard','Irvine','Jaimie','Jarad','Jayson','Jean','Jeff','Jerome','Joel','Jude','Kane','Karan','Karim','Kashif','Keiran','Kendon','Kent','Kwok','Laith','Lauchlan','Leo','Leyton','Lindsey','Logan','Lorn','Lyle','Mason','Mervyn','Michel','Mubarak','Mungo','Murdoch','Nathanael','Neall','Nickie','Nicky','Nikki','Nikolas','Paolo','Perry','Ranald','Rehan','Ricky','Rikki','Ritchie','Rizwan','Robertson','Roderic','Rolf','Ronan','Rowland','Sam','Scotland','Seth','Shahid','Shakeel','Sidney','Sinclair','Sonny','Taylor','Tin','Tomas','Travis','Tristan','Vernon','Vince','Waheed','Waseem','Wei','Wilson','Yan','Zak','Aamir','Abdullahi','Abdulrazak','Abraham','Adebayo','Adel','Adrain','Adriano','Ahmad','Ahmed','Aidon','Ajeet','Al-Motamid','Alaistair','Alberto','Aldo','Aldous','Alen','Alexandre','Alfredo','Alisteir','Allon','Alton','Alwyn','Aman','Amanda','Amato','Amir','Amit','Amitabha','Amos','Anand','Anant','Anastasi','Anastasio','Anastasios','Andres','Angel','Angelo','Anil','Anjam','Anjum','Ann','Antonius','Anwar','Aonghas','Aonghus','Aqif','Ardene','Ardle','Ari','Arif','Arlyn','Armando','Armond','Arne','Arnout','Arol','Aron','Aroon','Arshid','Arvid','Arvind','Asa','Asad','Asaf','Asam','Ashiqhusein','Ashwani','Asrar','Athol','Avees','Ayham','Ayokoladele','Ayron','Azzam','Balfour','Balraj','Barbara','Barnabas','Barron','Bartholomew','Basil','Bassam','Bayne','Ben-John','Bengiman','Benoit','Bernardo','Bevan','Bill','Bllal','Blythe','Bobby','Brad','Brant','Brook','Bryden','Byram','Byron','Caleb','Callam','Carey','Carol','Carreen','Cary','Casey','Cathorne','Chae','Charanjeev','Che','Chee','Chi','Chincdu','Christan','Christie','Christos','Chrys','Chu','Churnthoor','Ciaran','Ciaron','Ciobhan','Claus','Cliff','Clinton','Colan','Coll','Collin','Colum','Con','Connor','Corey','Corin','Cormac','Corren','Cowan','Craige','Cullen','Daiman','Daljit','Dall','Dameon','Damyon','Danga','Danielle','Darius','Daron','Darrel','Darrell','Darryll','Darryn','Davide','Davidson','Davinder','Davud','Davyd','Dawson','Dax','Del','Dell','Denver','Dermot','Derry','Derryl','Derryn','Diarmid','Diauddin','Dick','Diego','Dino','Dion','Dolan','Domenico','Domenyk','Donn','Donnie','Donny','Dorian','Dorino','Dougal','Dowell','Duane','Dugald','Dulip','Dylaan','Eamon','Ean','Earl','Eben','Edoardino','Efeoni','Egidio','Eiichi','El','Elgin','Ellis','Eloson','Emmanuel','Emran','Emrys','Eoghann','Erkan','Erl','Ernest','Erwin','Esmond','Ewing','Fabio','Feargus','Felix','Ferzund','Finbar','Finley','Fionn','Francesco','Francisco','Francois','Frankie','Frazier','Fu','Gabriel','Galen','Gallvin','Gardner','Garreth','Garry-John','Gawad','Geore','Georges','Georgio','Gerarde','Gerhard','Gethin','Ghassan','Gianni','Gillan','Gilmour','Ginno','Gino','Giovanni','Glynn','Godfrey','Grainger','Greggory','Gren','Grigor','Guido','Gurbal','Gurchinchel','Gurhimmat','Gurjeet','Gurkimat','Gurmeet','Gurvinder','Gustavus','Gwion','Haitham','Hani','Hardeep','Hassan','Hatim','Heather','Hedley','Hilton','Himesh','Hitesh','Hoi-Yuen','Hoy','Hsin','Hui','Hussain','Hytham','Ifeatu','Iffor','Ilya','Imeobong','Imtiaz','Iqbal','Isaac','Isabirye','Ishar','Islay','Ivy','Jackie','Jackson','Jaco','Jade','Jagan','Jagdeep','Janet','Jardine','Jarno','Jasbir','Jasen','Jasjeet','Jaspal','Jaspar','Jatinder','Javaid','Jean-Baptiste','Jedd','Jeffery','Jeremiah','Jeroen-Hans','Jerry','Jesse','Jim','Jimmy','Jimsheed','Joao','Jodie','Joe','Johan','Johann','John-Paul','Johnny','Jojeph','Jonathon','Jonson','Jose','Josep-Ramon','Joshua','Joss','Jreen','Judd','Julie','Julyan','Jusbunt','Justine','Ka','Ka-Poon','Kahl','Kai','Kaleem','Kam','Kameldeed','Kamran','Kari','Kayhan','Kearan','Kee','Keenan','Keir','Kelly','Kelman','Kenny','Kenrick','Kern','Kevyn','Khalid','Ki','Kia','Kiain','Kier','Kieren','King','Kiran','Knok','Ko','Konrad','Koon','Kristen','Kristin','Kristopher','Kulbant','Kuldeep','Kuldip','Kurt','Kurt-Gordon','Kwasi','Kyles','Laine','Laura','Lauren','Laurent','Lauri','Laychlan','Lea','Lee-William','Leevi','Lelio','Lenord','Lesley','Levi','Liaqat','Linn','Linsay','Lipton','Lisle','Lister','Littlesky','Loaie','Logie','Lorenzo','Lorraine','Loumont','Luigi','Luis','Luiz','Madunil','Majad','Maksymilian','Malkeet','Man','Mandeep','Manmath','Mansel','Mansoor','Manuel','Maqsood','Marcello','Marcos','Marek','Marin','Marino','Marjus','Markos','Marl','Marvan','Marvyn','Mary','Masood','Matt','Maurizio','Mazhar','Mcnamara','Melville','Melvin','Methven','Micah','Michal','Michele','Michelle','Miguel','Miles','Milo','Mirza','Mitchel','Moazzam','Modan','Mohd','Montgomery','Morrison','Moses','Moufid','Muctarr','Mugahid','Mukendi','Mukesh','Munnuwar','Muro','Mustapha','Nabil','Nadeem','Naeeh','Naeem','Navin','Naweed','Nazar','Neacal','Neale','Neel','Neilson','Nevil','Nicola','Nicolo','Niel','Nikolaos','Ninian','Nirmaljit','Nishal','Noah','Noureddine','Nwachukwu','Oneill','Obumneme','Odaro','Odin','Ogilvy','Olaf','Olivier','Omer','Orest','Orlando','Ormond','Orpheus','Osman','Otis-Chen','Oyvind','Pallab','Pamela','Parvez','Pasquale','Paulo','Pegasus','Petter','Phil','Pierce','Piero','Pierre','Pietro','Polo','Pravin','Quillan','Quintin','Rae','Raeph','Ragbir','Rahul','Rainer','Rajesh','Rajiv','Ramesh','Ramon','Rana','Randy','Ranjit','Rashid','Rauri','Raymund','Reagan','Reay','Redmond','Reece','Reese','Rene','Rex','Reynard','Reza','Rhoderick','Rhys','Rian','Richie','Ritchard','Robb','Robbi','Robertjohn','Rodden','Rodrick','Rohan','Rohit','Romolo','Roope','Rorie','Rowalan','Royston','Ruairi','Ruairidh','Russ','Russel','Ryan-John','Ryan-Lee','Sacha','Saddiq','Sajid','Saleem','Samarendra','Samir','Sanders','Sanjay','Saqib','Sarah','Sarfraz','Sargon','Sarmed','Sasid','Saul','Sccott','Sebastian','Sebastien','Sergio','Shabir','Shadi','Shafiq','Shahad','Shahed','Shahied','Shahriar','Shakel','Shamim','Sharon','Shawn','Shazad','Sheamus','Shehzad','Sheikh','Sheldon','Shibley','Shirlaw','Shuan','Shuyeb','Siddharta','Siegfried','Silas','Silver','Simpson','Sing','Sion','Sleem','Solomon','Somhairle','Soumit','Stacey','Stachick','Stephane','Stevan','Stevenson','Stevie','Stuard','Sufian','Suhail','Sun','Sunil','Suoud','Sven','Syed','Tabussam','Tad','Tai','Talal','Tam','Tamer','Tanapant','Tanvir','Tarek','Tariq','Tarl','Tarun','Tegan','Teginder','Terrance','Thabit','Theo','Thiseas','Thor','Thorfinn','Tino','Tjeerd','Tolulope','Toshi','Tracey','Trebor','Trent','Trygve','Tulsa','Tyrone','Umar','Valentine','Vikash','Vilyen','Wael','Waheedur','Waleed','Wam','Wanachak','Warner','Warrick','Wasim','Webster','Weir','Welsh','Weru','Wesley','Weston','Wilbs','Wilfred','Willis','Wing','Winston','Wlaoyslaw','Woon','Wun','Xavier','Yanik','Yannis','Yaser','Yasir','Yasser','Yazan','Yosof','Younis','Yuk','Yun','Zack','Zadjil','Zahid','Zain','Zakary','Zander','Zeeshan','Zen','Zeonard','Zi','Ziah','Zowie','Nicola','Karen','Fiona','Susan','Claire','Sharon','Angela','Gillian','Julie','Michelle','Jacqueline','Amanda','Tracy','Louise','Jennifer','Alison','Sarah','Donna','Caroline','Elaine','Lynn','Margaret','Elizabeth','Lesley','Deborah','Pauline','Lorraine','Laura','Lisa','Tracey','Carol','Linda','Lorna','Catherine','Wendy','Lynne','Yvonne','Pamela','Kirsty','Jane','Emma','Joanne','Heather','Suzanne','Anne','Diane','Helen','Victoria','Dawn','Mary','Samantha','Marie','Kerry','Ann','Hazel','Christine','Gail','Andrea','Clare','Sandra','Shona','Kathleen','Paula','Shirley','Denise','Melanie','Patricia','Audrey','Ruth','Jill','Lee','Leigh','Catriona','Rachel','Morag','Kirsten','Kirsteen','Katrina','Joanna','Lynsey','Cheryl','Debbie','Maureen','Janet','Aileen','Arlene','Zoe','Lindsay','Stephanie','Judith','Mandy','Jillian','Mhairi','Barbara','Carolyn','Gayle','Maria','Valerie','Christina','Marion','Frances','Michele','Lynda','Eileen','Janice','Kathryn','Kim','Allison','Julia','Alexandra','Mairi','Irene','Rhona','Carole','Katherine','Kelly','Nichola','Anna','Jean','Lucy','Rebecca','Sally','Teresa','Adele','Lindsey','Natalie','Sara','Lyn','Ashley','Brenda','Moira','Rosemary','Dianne','Kay','Eleanor','June','Geraldine','Marianne','Beverley','Evelyn','Leanne','Kirstie','Theresa','Agnes','Charlotte','Joan','Sheila','Clair','Hilary','Jayne','Sonia','Vivienne','Carla','Ellen','Emily','Morven','Debra','Janette','Gaynor','Rachael','Veronica','Vicky','Colette','Lyndsay','Maxine','Nicole','Sonya','Susanne','Alice','Georgina','Sheena','Leona','Tanya','Annette','Joyce','Ailsa','Avril','Iona','Isobel','Josephine','Kimberley','Sylvia','Lara','Linzi','Siobhan','Vanessa','Bernadette','Natasha','Monica','Esther','Hayley','Isabella','Rose','Roslyn','Tara','Adrienne','Carrie','Isabel','Jan','Janine','Justine','Kirstin','Norma','Rona','Shelley','Anne-Marie','Cara','Eilidh','Grace','Gwen','Isla','Vikki','Deirdre','Elspeth','Faye','Joy','Kara','Louisa','Naomi','Rosalind','Vicki','Amy','Hannah','Heidi','Leah','Lee-Ann','Lyndsey','Rhonda','Anita','Annie','April','Charmaine','Dorothy','Lynsay','Nadine','Penny','Sharron','Stacey','Charlene','Collette','Corinne','Kate','Katharine','Kerri','Kerrie','Linsey','Marjorie','Melissa','Helena','Jeanette','Marlene','Miranda','Roseann','Alana','Anthea','Morna','Andrina','Carol-Ann','Doreen','Juliet','Lauren','Nina','Nyree','Sarah-Jane','Sharlene','Simone','Beverly','Cindy','Diana','Dionne','Jacquelyn','Jenny','Johanne','Margo','Marina','Nancy','Trudy','Vivien','Wilma','Abigail','Alexis','Alyson','Angie','Ann-Marie','Annmarie','Belinda','Carolann','Carolanne','Eva','Eve','Glenda','Johanna','Karin','Kellie','Loraine','Lynette','Nadia','Penelope','Roberta','Tina','Gael','Gina','Ingrid','Lea','Marjory','Miriam','Philippa','Senga','Shonagh','Sophie','Catrina','Claudine','Constance','Edith','Erica','Katriona','Keli','Keri','Kristina','Laurie','Lucinda','Mari','Marlyn','Olivia','Paulene','Selina','Seonaid','Vivian','Williamina','Alexandria','Angeline','Antonia','Bridget','Candice','Carolyne','Cherie','Colleen','Connie','Daniella','Francesca','Gwendoline','Jessie','Jocelyn','Judy','Karina','Kaye','Kimberly','Lee-Anne','Lillian','Marian','Martha','May','Roisin','Shelagh','Sophia','Susanna','Aimee','Amanda-Jane','Amber','Beth','Caren','Claudia','Corrine','Euphemia','Jessica','Katie','Leeanne','Leila','Lilian','Liza','Madeleine','Marcia','Maree','Marilyn','Marisa','Myra','Olga','Sasha','Sharleen','Sian','Sonja','Tammy','Tania','Teri','Tessa','Toni','Tricia','Yasmin','Alexa','Amelia','Andrena','Annabel','Annemarie','Arleen','Carmen','Cecilia','Chloe','Corrie','Dana','Danielle','Davina','Deanne','Elisabeth','Elise','Estelle','Florence','Francine','Georgia','Henrietta','Jade','Jeanie','Jo-Anne','Jody','Julie-Ann','Juliette','Kareen','Kirstine','Kristeen','Lana','Leigh-Ann','Lesley-Ann','Leslie','Linsay','Lois','Lucie','Lucille','Madeline','Marnie','Nora','Noreen','Rae','Rhoda','Robyn','Sacha','Sandie','Sheryl','Shiona','Sinead','Stella','Una','Vari','Violet','Zara','Ailie','Alaine','Alanna','Allyson','Andria','Bianca','Billie','Caireen','Carol-Anne','Caron','Cathleen','Christian','Coleen','Dennise','Donalda','Evonne','Fay','Harriet','Holly','Janie','Janis','Jenifer','Jodi','Johann','Karan','Kari','Katy','Keira','Kristine','Layla','Leeann','Leigh-Anne','Leonora','Lianne','Lindy','Lynnette','Marissa','Marsha','Megan','Monique','Nicolette','Norah','Phyllis','Rhian','Rosaleen','Rosalyn','Rosemarie','Rowan','Saira','Shauna','Shazia','Stacy','Susannah','Tamara','Terri','Terry','Therese','Trudi','Vanda','Verity','Vickie','Wanda','Yvette','Zoey','Adeline','Aimi','Ainsley','Ainslie','Alexandrina','Anastasia','Anna-Marie','Annabell','Camilla','Carina','Carly','Catherina','Cathryn','Charis','Charlaine','Corinna','Corrina','Cristina','Darlene','Debora','Delia','Della','Dona','Elena','Elinor','Emma-Jane','Eunice','Felicity','Fionnuala','Gabrielle','Gloria','Greer','Ilene','Imogen','Iris','Ishbel','Jeannette','Jemima','Jilly','Joann','Johan','Julie-Anne','Karla','Karra','Karyn','Katrine','Kelley','Kelli','Kerry-Anne','Kirsta','Kirstien','Krista','Kristen','Kristi','Kristian','Krysia','Kyra','Leann','Leanna','Lena','Leza','Liana','Lisa-Marie','Lorette','Lydia','Mairead','Martina','Muriel','Parveen','Pauleen','Polly','Rania','Rita','Rosanne','Samantha-Jane','Shane','Sharlyn','Sheelagh','Sheona','Sheree','Suzanna','Suzy','Thea','Tonya','Vera','Yuen','Alena','Alix','Allana','Allanna','Alma','Angelina','Anji','Annamarie','Anneli','Annelise','Antoinette','Ava','Averil','Ayshea','Bernice','Betsy','Betty','Briony','Bushra','Cali','Carey','Cari','Carolan','Carolina','Carolynn','Carrie-Anne','Carron','Catharine','Celeste','Celia','Celine','Ceri','Chelsey','Cherelle','Cherry','Cheryll','Choi','Chrisma','Clarissa','Clayre','Clea','Coreen','Cornelia','Courtney','Dagmar','Daniela','Debbi','Desiree','Dian','Donella','Donna-Marie','Dorcas','Elisabetta','Eliza','Elma','Eloise','Elsa','Elsie','Emer','Erika','Esme','Faith','Farhat','Fionna','Flora','Freya','Gay','Giulia','Gwendolyn','Haley','Hebah','Helene','Hellen','Heloise','Hester','Ilona','Ina','Inga','Ivonne','Jackie','Jacqualine','Janeen','Jaqueline','Jasmine','Jeanne','Jemma','Jennie','Jo','Jo-Ann','Jodie','John','Joni','Julianne','Karen-Louise','Karis','Karlyn','Karrie','Katheryn','Kathrine','Kelda','Kellie-Ann','Kirstene','Kirsti','Kirstina','Kirstyn','Kwai','Kylie','Kym','Laila','Larissa','Larraine','Lauraine','Lea-Anne','Leaona','Leesa','Lenore','Leoni','Letitia','Li','Liane','Lily','Ling','Linzie','Lissa','Lizanne','Lorena','Loretta','Lucia','Luisa','Luise','Lynore','Madelaine','Maeve','Maggie','Mai','Marcella','Margot','Marie-Ann','Marney','Marni','Marrianne','Maryann','Maryanne','Maryjane','Matilda','Maura','Maya','Meave','Mellissa','Meredith','Mhari','Michaela','Mona','Moyra','Mylene','Nan','Narelle','Nathalie','Nazia','Nicki','Nickola','Nicolla','Nicolle','Nikki','Nirmal','Nisha','Nuala','Pamella','Paul','Petra','Petrina','Rachelle','Raelene','Rebekah','Reena','Rena','Renee','Rhea','Robert','Robina','Romila','Rosalin','Rosamund','Rosanna','Roseanne','Rosslyn','Rosslynn','Rowena','Rupinder','Sadie','Saima','Salma','Samina','Selena','Serena','Shabana','Shaheen','Shameem','Sharan','Shareen','Sharren','Sherry','Sorcha','Stephannie','Stroma','Tammie','Tasneem','Thomasina','Tracie','Ursula','Uzma','Wai','Winifred','Yolanda','Yolande','Zandra','Aalia','Abadah','Abbey','Abida','Ada','Adalaine','Adalbjorg','Adel','Adelaide','Adelle','Aditi','Adriana','Adrianne','Afshan','Ailaidh','Aimie','Ainnia','Aisha','Aisling','Alain','Alex','Alexine','Ali','Alicia','Alienor','Aline','Alisa','Alisha','Alissa','Alka','Allene','Almanda','Alona','Alvina','Alvise','Alwyn','Ama','Amand','Amanda-Jayne','Amat-Ul','Amita','Ana','Anabel','Andreana','Andreena','Andrewina','Andriena','Andrinna','Andromeda','Andwina','Aneela','Aness','Angelene','Angelia','Angelique','Angelita','Angelle','Angharad','Anisa','Anja','Anjim','Anna-Katrina','Anna-Lise','Anna-Louise','Anna-Maria','Annabella','Annalee','Annaline','Annamaria','Annavore','Anndreana','Anneliese','Ansley','Anupam','Anwar','Anya','Ara','Areena','Arianne','Arlane','Arlenne','Arlette','Arline','Arona','Arshaluse','Ase-Kristin','Aseeia','Asfia','Asha','Ashleigh','Ashlene','Ashley-Jo','Asma','Asra','Astrid','Atinuke','Aubren','Audra','Autumn','Ayeshea','Ayse','Azra','Babette','Bade','Baltit','Balwinder','Barbara-Anne','Barbra','Beatrice','Benedicte','Bernardette','Beverlee','Bhupinder','Bianca-Louise','Bibiana','Bik','Billie-Jo','Bilquis','Blyth','Bobbie','Bonetta','Bonnie','Bozena','Brandy','Breigh','Brian','Bridgene','Brigid','Bronia','Brooke','Bryony','Buffy','Cailinn','Caira','Cairan','Cameille','Campbell','Candy','Cara-Louise','Cara-Lyn','Caralyn','Caralynn','Carean','Carene','Carianne','Carin','Carla-Anne','Carlanne','Carlene','Carli','Carlin','Carlina','Carlyn','Carlynn','Carn','Carri','Carrianne','Carrie-Ann','Carriean','Carthagena','Caryann','Caryll','Caryn','Carys','Casfa','Cassandra','Caterina','Catherin','Cathlene','Catina','Catreona','Catrine','Catrona','Catronia','Caulette','Cecile','Celesbial','Chaitali','Chanel','Chantal','Charelle','Charissa','Charity','Charlanne','Charline','Charmian','Charni','Chau','Cheri','Cherise','Cherris','Cheryline','Chevan','Chiara','Chrisann','Chrisanna','Chrisanne','Chrissie','Christan','Christeen','Christel','Christene','Christianne','Christy','Ciona','Cirsty','Claddia','Claire-Marie','Clara','Clare-Ann','Clementine','Cleonie','Clinton','Clionagh','Colina','Cora','Coral','Coralie','Coralynne','Cordeilla','Cori','Corina','Corley','Correen','Correne','Corrinna','Cory','Cyndie','Cynthia','Cyrena','Daen','Daisy','Dale','Dalia','Danielia','Daria','Darice','Darla','Darlaine','Darleen','Daunne','David','Davidina','Dawn-Maree','Dawna','Dawne','Dawnmarie','Dawnna','Deaonne','Debbie-Anne','Deborah-Ann','Dee','Deeba','Deidre','Deirdrie','Delanie','Delphine','Delyth','Dena','Denice','Denize','Denyse','Derna','Desirae','Devinder','Deziree','Diahann','Dietke','Dina','Dineo','Dione','Dominica','Dominie','Donagh','Donald','Donijka','Donna-Louise','Doranne','Doris','Dorna','Dulsie','Dvanessa','Dyanne','Easter','Ebony','Ebru','Edain','Edele','Edwina','Eenbar','Eila','Eilaine','Eilanda','Ekpeleamaka','Elaina','Elayne','Eleanora','Elenore','Eleonor','Elishia','Elissa','Elizabeth-Ann','Elizabeth-Anne','Ella','Ellieh','Ellison','Eloisa','Els','Elspet','Elyse','Ema','Eman','Emilia','Emma-Jay','Emma-Louise','Emmeline','Encarnita','Erin','Ester','Etive','Eutilia','Evette','Fadelma','Faheem','Fahmeeda','Faiqa','Farah','Farat','Farhana','Fatemah','Fehmeeda','Felicia','Ferdosh','Feriah','Ferlin','Finan','Fionn','Foye','Frances-Anne','Francetta','Freda','Freyja','Frosoulla','Fyona','Gala','Gale','Garveen','Gary','Gaye','Gaylene','Gayner','Gaynore','Geeta','Gemma','Genene','Genista','George','Georgette','Georgine','Geradine','Geraldene','Gerda','Germana','Ghzala','Gillianesther','Gilliann','Giselle','Giuliana','Gladys','Glenys','Glynis','Glynnis','Gordina','Grainne','Gudrun','Gullniz','Gulseren','Gwenne','Gwyneth','Hailey','Hamsa','Hania','Hanne','Harjean','Harjinder','Harminder','Hazel-Ann','Heather-Mairi','Heathermay','Hedda','Heidi-Louise','Heleanor','Helga','Hellinska','Hilda','Hilde','Hind','Hollie','Homa','Honey','Honor','Hsuehmei','Ianswythe','Idell','Ifeoma','Ilana','Ilham','Illona','Ilse','Imelda','Immacolata','Imose','Inderjit','Inge','Ingeborg','Innes','Iram','Irena','Irenie','Isabell','Ishabel','Islaen','Islay','Isolde','Ivy','Jacinta','Jackalyn','Jackeline','Jackson','Jacquelynn','Jacqui','Jagdeep','Jagmfet','Jaine','Jaklyn','Jamesina','Jan-Marie','Jane-Marie','Janeane','Janeeta','Janetta','Janey','Janferie','Janka','Jaqualine','Jasmina','Jaswant','Jean-Marie','Jeanna','Jeannie','Jena','Jenda','Jenefer','Jeneth','Jenna','Jennyfer','Jessa','Jetta','Jhovana','Jinny','Jinty','Joanna-Marie','Joannah','Joanne-Lee','Jocasta','Jodhi','Joe-Ann','Johane','Johcelian','Johnann','Johnanna','Jolanda','Jolene','Jorie','Joseph','Joy-Ann','Jozann','Jude','Juli','Julian','Julianna','Juniper','Ka','Kae','Kaera','Kairo','Kama','Kamaljit','Kandy','Karen-Ann','Karena','Karima','Karine','Karleen','Karlene','Karlin','Karne','Karolyn','Karon','Karren','Karrien','Kasha','Katarina','Katerina','Katey','Katha','Kathlene','Kathy','Kati','Katrien','Katrinaa','Katryn','Katya','Kavil','Kawal','Keeley','Keir','Kelly-Anne','Kemi','Kendal','Kendra','Kenna','Kereen','Keren','Kerena','Kerky','Kerra','Kerray','Kerray-Anne','Kerri-Ann','Kerrie-Ann','Kerryann','Kerstin','Keziah','Khadine','Kiasty','Killian','Kimber','Kira','Kirstein','Kirstey','Kirstin-Shona','Kirsty-Ann','Kiva','Kjersti','Klventh','Korena','Krischa','Kristan','Kristy','Krysta','Kulveer','Kyla','Kymberley','Lada','Ladyemma','Lalainia','Lalita','Laraine','Larna','Lasuru','Latifa','Laura-Ann','Laura-Jane','Laura-Jo','Laurae','Laurena','Lauri','Laurn','Laurna','Lavinia','Layna','Leagh','Leanda','Leanor','Leasa','Leeanna','Leeon','Lefona','Leighann','Leisha','Lela','Lene','Lenel','Leonna','Leore','Lesa','Lesley-Anne','Lesleyann','Lesleyanne','Lewelle','Lezza','Lian','Liann','Licia','Lidia','Lilias','Lillias','Liming','Lina','Lindsay-Anne','Lindsaye','Lindsy','Linette','Linn','Linzey','Lisa-Claire','Lisette','Lola','Lorain','Lorainne','Loramay','Loran','Lorelle','Loren','Lori','Lori-Ann','Lori-Leigh','Loriane','Lorianne','Lorinda','Lorna-Anne','Lorrell','Lotus','Louis','Louisina','Louisse','Lousise','Luan','Lubnina','Luciene','Lucilla','Luna','Luthien','Lyanne','Lyndel','Lyndie','Lyne','Lynelle','Lynn-Maree','Lynsie','Ma','Mabel','Macarena','Machala','Madelene','Madelyn','Madge','Madia','Maegan','Magda','Magda-Mor','Magdalena','Mahri','Maibi','Maida','Maimoona','Mairi-Clare','Mairi-Joanne','Mairianne','Malina','Malina-Louise','Malize','Mamtaz','Man','Manal','Manda','Manjit','Manuela','Maomi','Mara','Marcell','Marcillena','Marcina','Marellen','Maretta','Margarot','Margrethe','Marguerite','Mari-Ann','Mari-Claire','Mariah','Mariana','Marianna','Marica','Maricia','Marie-Anne','Marie-Antoinett','Marie-Claire','Marie-Karen','Marie-Louise','Mariesha','Mariessa','Marilynn','Marise','Marisha','Marjie','Marla','Marleen','Marnee','Marny','Marrianna','Marrica','Marrissa','Marsa','Marsali','Marshalee','Martell','Martine-Anne','Martyne','Marwa','Mary-Ann','Mary-Anne','Mary-Frances','Marylee','Maryth','Maud','Maunika','Me','Meaghan','Mei','Mel','Melainie','Melanie-Jane','Melina','Melinda','Melisa','Melodie','Melody-Anne','Melona','Melonie','Melony','Melysa','Merle','Merren','Merrilie','Mhairi-Clair','Michael','Michaelle','Mieke','Mignonne','Mildred','Millicent','Min','Mina','Ming','Minna','Minnie','Mira','Mirelle','Mirissa','Mirrisa','Misa','Moonie','Mora','Morissa','Muala','Munaza','Murdette','Murdina','Musarat','Mutch','Myriam','Nabdia','Nageen','Nahala','Nahla','Nalane','Nanakee','Nanditha','Nanvula','Nanze','Narene','Nargus','Narinder','Nasira','Nasreen','Natalina','Naureen','Navkiran','Naziah','Nazma','Nazzra','Neeltje','Neerja','Neiliann','Nerissa','Ngairi','Nhairi','Nicholina','Nicoletta','Nikola','Nirvana','Nita','Noel','Noeleen','Noha','Nolwenn','Noorjehan','Noreena','Norianne','Norma-Jean','Nosheen','Nova','Noveljit','Novzha','Nusarut','Nuzhat','Odette','Oenone','Oi','Oisin','Olive','Olufunmilayo','Olwyn','Omaira','Omanda','On','Oonagh','Orainne','Orla','Oyenmwen','Pamala','Pamela-Ann','Paola','Parisa','Patsy-Ann','Paula-Ann','Paulla','Pendel','Perdita','Peri','Pervein','Pesar','Peter','Petre','Philomena','Pilar','Pippa','Pollyanna','Prabjote','Preetpal','Priscilla','Pritpal','Priya','Pui','Pui-Wan','Puja','Pulwander','Rabeea','Rabhia','Rabia','Rabiah','Radha','Raechel','Raihat','Raina','Rajdip','Rajwant','Rakhi','Ramona','Raneyah','Rani','Ranjit','Rashelle','Raynald','Razina','Reema','Regan','Rehana','Rekha','Remena','Renay','Rennie','Rhiannon','Rhianwen','Rhowan','Risa','Rita-Teresa','Rna','Rochelle','Rohini','Roistn','Roma','Rosalie','Rosalinde','Rosaline','Rosalynd','Rosalynn','Rosceallia','Rosehelen','Roseleen','Roselyn','Roselynn','Rosheen','Rosie','Roslin','Roslynn','Roslynne','Rossa','Rothnie','Roxanne','Rozan','Rozanne','Rubina','Rubyina','Rusha','Saara','Sabera','Sabina','Sabita','Sabreena','Sabrina','Sadia','Safia','Safiya','Sahar','Sahira','Sahnaz','Saibvhonn','Saifone','Sairah','Sajdah','Sajida','Sajni','Salena','Sally-Anne','Salvina','Sameena','Samera','Samfya','Samima','Sampa','San','Sandrine','Sangeeta','Saphire','Saqib','Sara-Jane','Sara-Louise','Sara-Simone','Sarah-Louise','Sarra','Sarwat','Saskia','Sau','Savannah','Scho','Seana','Seleena','Semra','Sengul','Seobhan','Seona','Seonad','Sereena','Shaaron','Shabnum','Shadha','Shagofta','Shahana','Shahbano','Shaheena','Shaher','Shahnaz','Shahynaz','Shaida','Shaidh','Shaista','Shakeela','Shamiem','Shamshad','Shan','Shanaz','Shann','Shannon','Sharareh','Sharen','Sharmila','Sharon-Anne','Sharyn','Shastha','Shawn','Shawvinder','Shazya','Shebegeni','Shehla','Shelby','Shella','Shelley-Lynn','Shellie','Shelly','Shemina','Shenaz','Shendl','Sherilyn','Sherlee','Sherlen','Sherlene','Sherree','Sherree-Anne','Sherrie','Sheuli','Shibion','Shibon','Shidha','Shing','Shirella','Shirley-Ann','Shivonne','Shobhana','Shoena','Shonag','Shonaid','Shonna','Shuk','Shuna','Sianne','Sigrid','Silvana','Silvia','Sime','Simina','Simonetta','Simonne','Simran','Sindy','Sineaid','Siobhann','Siobhian','Siobhion','Siona','Siubhan','Sky','Skye','Slochna','Soha','Solveig','Solvey','Sonal','Sonje','Sonney','Soreena','Soryia','Stacey-Anne','Stephaney','Stephen','Strathie','Sue','Suheyla','Sujata','Sujatha','Sukhjit','Sukhvinder','Sula','Sultana','Sumana','Suna','Surinder','Surya','Suzan','Suzannah','Suzette','Suzi','Swabat','Sybil','Syma','Tabatha','Tabitha','Tala','Talula','Tamarys','Tamazin','Tammi','Tamsin','Tanera','Tanja','Tanoja','Tansy','Taranty','Tarena','Tarya','Tasmin','Tatum','Tehiroona','Tehmeena','Teinna','Tereen','Thabile','Thanuja','Thariea','Therasia','Theressa','Thomazina','Thona','Tina-Marie','Titilayo','Toby','Tracey-Anne','Tracey-Jane','Tracy-Ann','Trista','Tryphena','Tullia','Tyla','Valma','Vannessa','Vanya','Varri','Vega','Venetia','Venus','Verona','Veronka','Vibeke','Viki','Vinita','Virginia','Viviene','Voianne','Wei','Wendie','Wendy-Anne','Wendy-Jane','William','Wing-Ming','Xanthe','Xenia','Xue','Yael','Yan','Yanina','Yee','Yenyuk','Yesmin','Yip','York','Yuk','Yves','Zahida','Zahidah','Zaida','Zainabu','Zana','Zanic','Zanthea','Zeena','Zeenat','Zeneide','Zenobia','Zeus','Zillah','Zillan','Zinnia','Zita','Zohra','Zoie','Zona','Zorena','Zubaida','Zynisha','David','John','Paul','James','Mark','Scott','Andrew','Steven','Robert','Stephen','Craig','Christopher','Alan','Michael','Stuart','William','Kevin','Colin','Brian','Derek','Neil','Richard','Gary','Barry','Martin','Thomas','Ian','Gordon','Kenneth','Alexander','Graeme','Peter','Iain','Graham','Jason','George','Allan','Keith','Darren','Simon','Douglas','Ross','Stewart','Lee','Grant','Nicholas','Joseph','Gavin','Anthony','Jonathan','Daniel','Fraser','Matthew','Donald','Malcolm','Alistair','Edward','Raymond','Charles','Philip','Bruce','Garry','Jamie','Ryan','Bryan','Francis','Alastair','Duncan','Patrick','Ronald','Alasdair','Ewan','Marc','Wayne','Hugh','Robin','Sean','Calum','Euan','Adam','Russell','Cameron','Gerard','Murray','Norman','Angus','Greig','Justin','Gregor','Gerald','Roderick','Roy','Benjamin','Timothy','Dean','Samuel','Greg','Shaun','Adrian','Campbell','Eric','Niall','Glen','Trevor','Antony','Gareth','Barrie','Frank','Leslie','Liam','Henry','Bernard','Callum','Dale','Brendan','Dominic','Owen','Vincent','Damian','Roger','Desmond','Jon','Aaron','Gregory','Hamish','Christian','Mohammad','Ewen','Gregg','Terence','Arthur','Derrick','Fergus','Jack','Lewis','Lindsay','Mohammed','Clark','Laurence','Martyn','Walter','Alisdair','Ben','Denis','Frazer','Jeremy','Nigel','Terry','Blair','Innes','Jeffrey','Nathan','Phillip','Rory','Crawford','Glenn','Karl','Lawrence','Marcus','Neill','Scot','Steve','Tony','Dennis','Guy','Jay','Brett','Kieran','Leonard','Murdo','Oliver','Alister','Archibald','Billy','Elliot','Geoffrey','Gilbert','Harry','Lorne','Stanley','Victor','Julian','Kris','Ralph','Rodney','Shane','Alex','Austin','Darryl','Kirk','Leigh','Magnus','Neal','Sandy','Warren','Bradley','Clifford','Don','Drew','Evan','Finlay','Giles','Ivan','Keir','Leon','Moray','Morgan','Robbie','Sam','Allen','Chi','Dugald','Dylan','Frederick','Gerrard','Ivor','Myles','Nicol','Nicolas','Ricky','Ronnie','Aidan','Albert','Alun','Carl','Chris','Darrin','Edmund','Findlay','Jody','Kevan','Lachlan','Lloyd','Luke','Marco','Mario','Muhammad','Noel','Tristan','Alfred','Antonio','Arran','Arron','Boyd','Brent','Damien','Darran','Dougal','Erik','Forbes','Grahame','Imran','Jim','Johnnie','Kristian','Kyle','Laurie','Louis','Marcel','Mathew','Murdoch','Nadeem','Roddy','Wai','Zachary','Benedict','Carlo','Danny','Daryl','Hendry','Howard','Johnathan','Jose','Joshua','Keiran','Kieron','Mitchell','Muir','Nairn','Niel','Nolan','Omar','Ray','Rodger','Stephan','Struan','Wilson','Ahmad','Allister','Angelo','Archie','Asif','Bobby','Chad','Christie','Ciaran','Clinton','Conrad','Cornelius','Daron','Darryn','Deryck','Diarmid','Edwin','Eoin','Erlend','Faisal','Francesco','Garrie','Giovanni','Giuseppe','Glyn','Hector','Hugo','Irvine','Jackie','John-Paul','Johnny','Johnston','Keiron','Kerr','Kristoffer','Kristofor','Lyall','Marshall','Maurice','Nathaniel','Quintin','Ramon','Ramsay','Ranald','Rikki','Ritchie','Rowan','Ruairidh','Ruaraidh','Salvatore','Sidney','Simeon','Sinclair','Stefan','Stevan','Toby','Tom','Troy','Wallace','Ahmed','Alaistair','Alec','Alick','Andre','Andrea','Andreas','Andres','Anton','Arnold','Ashley','Ashraf','Austen','Bartholomew','Carey','Charlie','Chun','Cliff','Clive','Coinneach','Collin','Damion','Daren','Dario','Darrell','Darroch','Darryll','Denny','Dereck','Derick','Dieter','Dinesh','Dino','Dougall','Earl','Eion','Elliott','Ernest','Errol','Fernando','Garth','Gerardo','Gideon','Gillies','Gilmour','Glynn','Grainger','Grieg','Hamilton','Hank','Hans','Harold','Harvey','Herbert','Huw','Innis','Jaimie','Jan','Jayson','Jeffery','Jerome','Joachim','Joe','Joel','Jon-Paul','Jonathon','Jude','Ka','Kaj','Karim','Kok','Konrad','Kristopher','Kurt','Lincoln','Liston','Logan','Man','Mandeep','Marcos','Marek','Marvin','Matt','Maxwell','Melvin','Mervyn','Miguel','Miles','Mohamed','Morven','Mungo','Munro','Navdeep','Neville','Nikolas','Pat','Quinton','Raj','Rennie','Ricki','Rolf','Roshan','Royston','Ruari','Rupert','Rupinder','Russel','Sajjad','Saleem','Shahid','Shannon','Shawn','Shehzad','Shiraz','Spencer','Stefano','Tim','Wesley','Aaron-Howard','Abdulraheem','Abhay','Abie','Abudul','Adamo','Aden','Adhamh','Adinon','Adriano','Adryan','Aftab','Afzal','Aimon','Aitken','Ajay','Akass','Alaister','Alasdhair','Alberto','Aled','Alexandra','Alexis','Alexs','Alexzander','Ali','Alieu','Allyn','Alok','Alvin','Aly','Alyn','Amar','Amer','Amit','Amjed','Ammar','Amnar','Andrew-George','Andy','Anil','Anmar','Antoni','Antonius','Aonghas','Aran','Arfan','Arfat','Argyrios','Arjuna','Armand','Arnaud','Arne','Arshad','Asaad','Asa','Asam','Ashton','Asim','Asish','Assaad','Aston','Ataf','Athol','Athole','Atif','Atriano','Auday','Aynsley','Ayron','Azeem','Azziz','Babar','Baby','Bahader','Barbar','Barnabas','Barnaby','Barray','Barry-John','Barryjon','Basab','Bhopinder','Bilal','Bill','Blayre','Blyth','Brenden','Brendon','Brenton','Bretton','Brion','Brook','Bryce','Bryden','Buchanan','Byron','Cain','Caine','Calan','Callumn','Calumn','Campbell-John','Carlos','Carnell','Carol','Carrick','Cary','Casey','Cator','Cecil','Cennydd','Cenydd','Cerdin','Cesare','Chandran','Channa','Che','Chee','Christoffer','Christoher','Chrysler','Chukwujekwu','Ciaron','Cieran','Ciraeme','Clarke','Clifton','Clint','Colvin','Conor','Corey','Corin','Corrin','Cris','Curtis','Cyavash','Cyril','Darcy','Dallas','Dalwinder','Damione','Damon','Daniele','Danni','Daragh','Darnell','Darrol','Darron','Darryal','Daryn','Dave','Dawson','Dax','Deane','Declan','Dee','Delroy','Dene','Denver','Denzil','Dermont','Dermott','Derryck','Derryk','Desiderio','Devlin','Devsharma','Dewi','Dexter','Diego','Dillon','Dimitrius','Domhnall','Dominick','Donal','Donan','Doniel','Donn','Donnell','Donnie','Donny','Dorian','Drue','Drummond','Duane','Dyfed','Eain','Eamonn','Eden','Edgar','Edvard','Ehthisham','Ehtsham','Einar','El','Eli','Elias','Eliman','Elio','Elizabeth','Elliott-John','Ellis','Emanuel','Emilio','Emran','Enda','Enrico','Erick','Erin','Erique','Erling','Ernesto','Espen','Euart','Everth','Ewing','Fabian','Fahd','Fahri','Falcon','Farid','Fehad','Felix','Fermin','Fesial','Finbar','Finnian','Fiona','Franchi','Francisco','Franco','Frederic','Frederik','Fredrick','Frith','Fu','Furraz','Gabriel','Garin','Garnett','Garrett','Garrith','Gavain','Gen','Geoff','Geraint','Ghazanfar','Giacomo','Giancarlo','Gianmauro','Gianno','Gibson','Gilad','Gilleasbuig','Gillis','Gino','Girvan','Glyndwr','Graeme-John','Graym','Greame','Gregan','Grier','Grigor','Gurather','Gurdita','Gurnam','Gurpinder','Gwok','Hanif','Harjinder','Harnake','Harun','Hassam','Hatim','Hattan','Hayden','Helen','Henricus','Hew','Hildebrandt','Hisham','Hong','Hsi','Hughan','Hunter','Hyland','Hylton','Ian-Paul','Idem','Ien','Ihsan','Ihtisham','Im-Tiaz-Ul-Haq','Irfaan','Iuan','Ivar','Jaan','Jacob','Jacques','Jade','Jagmone','Jai','Jaibo','Jaime','Jamal','Jameson','Jamieson','Jared-Balthazar','Jas','Jasarat','Jasjeet','Jaspal','Jasson','Jatinder','Javes','Jean','Jefferson','Jenson','Jeroen','Jerrard','Jesse','Jesus','Jethro','Jevan','Jillian','Jimmy','John-Charles','John-Henry','Johnesh','Jonas','Jonathen','Jonpaul','Jordan','Jorge','Juan','Julien','Justine','Kaine','Kalmarc','Kam','Kamran','Kan','Karl-Heinz','Karma','Kashif','Kasim','Kat','Kayvohn','Kcarrie','Kelvin','Kennedy','Kenny','Kent','Kenyon','Kered','Kerry','Keven','Khalid','Khalil','Kian','Kiley','Kimble','Kin','Kinloch','Kinnell','Kipps','Kirpal','Koray','Kristiffer','Kristin','Kulvinder','Kwai','Kwame','Kwok','Kwong','Kylin','Laird','Lamy','Lance','Larry','Lawrie','Lawson','Leandro','Leeon','Leighton','Lembyt','Len','Lennox','Leonida','Lesley','Levon','Lex','Linda','Lindon','Lindsey','Llewelyn','Lluis','Loren','Lorenzo','Louaz','Luay','Ludovic','Luigi','Luis','Lyndon','Maicol','Manson','Manus','Maqbool','Marc-Philipp','Marcello','Marik','Marino','Mark-James','Markus','Martino','Martyne','Mary','Masood','Masoom','Massimo','Mathieson','Mathieu','Matthias','Maurizio','Max','Mear','Meldrum','Melvyn','Menachem','Merlin','Merril','Michal','Michelangelo','Micholas','Mickael','Millard','Milton','Mir','Mohamad','Moiz','Monica','Montgomery','Moreno','Morris','Motasim','Moyasr','Muhammed','Muhmod','Mukesh','Munir','Nadeam','Nader','Nadim','Nadir','Naill','Nalin','Namaan','Naseem','Naseer','Navaid','Navesh','Navin','Neilsen','Nelson','Nethan','Nicco','Nichol','Nicki','Nickolas','Nicoll','Niell','Nirvana','Nis','Nisith','Nnaemeka','Noah','Noble','Norval','Nushi','Nyall','Okoro','Oladele','Olav','Olusegun','Olutolu','Oluwamayowa','Omekpo','Oriano','Orlando','Osman','Ossian','Ozgur','Pabinder','Padraic','Pankaj','Paolo','Pardeep','Parminder','Patrizio','Pearson','Perhet','Perrin','Perry','Pervez','Philippe','Philippos','Phineus','Pietro','Poshitha','Prithipal','Pui-Keung','Qasif','Quentin','Rae','Raegen','Rafee','Raja','Rajan','Rajesh','Rajinder','Rajvinder','Ralf','Rana','Ranjeet','Ranjeev','Ranjit','Raonull','Raphael','Rashaid','Raymund','Reaaz','Rehan','Rehman','Reid','Reinaldo','Remo','Renato','Reto','Reuben','Rey','Rezwan','Rfakat','Rhian','Rhoderick','Rhuari','Riaz','Riccardo','Richie','Richy','Rizwan','Rob','Robb','Robbie-John','Roberto','Robindra','Roddi','Rodrigo','Rogan','Rolland','Ron','Roni','Roser','Roye','Ruan','Ruarri','Ruazrioh','Rudi','Rudy','Sai','Sajad','Sajed','Sajid','Salim','Sameer','Samir','Sandeep','Sanjay','Sanjeet','Sanjit','Sanjoy','Sara','Saroop','Satish','Satminder','Satpal','Scotland','Scottland','Se-Lerg','Sean-Paul','Selim','Sergio','Shah','Shahbaz','Shahbear','Shahzad','Shakil','Sharif','Shaune','Shayne','Shehbaz','Sheikh','Shizad','Shona','Shu-Chuen','Sigurjon','Silas','Silvano','Sion','Siu','Sivan','Skander','Skye-Daniel','Solomon','Sonny','Spence','Sreedhar','Stanton','Stephane','Stevon','Suboor','Sudhesh','Suhaimi','Sui','Sukhvir','Surash','Surjit','Sverre','Swaraj','Sydney','Syeed-Ur','Sylvanus','Symon','Tai','Tak','Tamlyn','Tammas','Tanveer','Tarek','Tariq','Tarlochan','Techung','Tekena','Telford','Terrence','Theo','Theodore','Thor','Tiernan','Timshel','Timur','Tin','Tobias','Tobin','Tomasz','Tommy','Torquil','Torran','Travis','Tristian','Tristram','Tsueng','Tyrel','Tyrone','Udai','Udayan','Ultan','Valerio','Vance','Vernon','Vincenzo','Virgile','Vivak','Wadah','Wajad','Wam','Warrington','Waseem','Wasim','Watson','Wei','Werner','Wesam','William-Scott','Wing','Winstin','Winston','Woodall','Wren','Yaman','Yaw','Yoon','Yousaf','Yousef','Yousif','Yunis','Yusef','Zack','Zaheer','Zahir','Zeshan','Zulfiqar','Zygmunt','Nicola','Karen','Susan','Claire','Fiona','Angela','Sharon','Gillian','Julie','Jennifer','Michelle','Louise','Lisa','Amanda','Donna','Tracy','Alison','Elaine','Jacqueline','Sarah','Caroline','Elizabeth','Laura','Lynn','Deborah','Lesley','Margaret','Joanne','Pauline','Lorraine','Carol','Kirsty','Yvonne','Lorna','Emma','Lynne','Tracey','Heather','Catherine','Pamela','Helen','Linda','Jane','Anne','Kerry','Suzanne','Wendy','Victoria','Diane','Mary','Dawn','Clare','Gail','Paula','Ann','Shona','Hazel','Christine','Andrea','Samantha','Marie','Lynsey','Sandra','Denise','Lee','Kelly','Gayle','Debbie','Jill','Kathleen','Patricia','Joanna','Catriona','Shirley','Ruth','Zoe','Leigh','Rachel','Melanie','Kirsteen','Aileen','Christina','Janet','Katrina','Stephanie','Audrey','Kirsten','Arlene','Maureen','Morag','Marion','Mhairi','Allison','Cheryl','Maria','Kim','Anna','Lindsay','Rebecca','Katherine','Mandy','Ashley','Frances','Barbara','Jillian','Lynda','Janice','Lucy','Michele','Natalie','Sara','Judith','Kathryn','Eleanor','Carolyn','Mairi','Carole','Valerie','Leanne','Irene','Jean','Sally','Vicki','Lindsey','Eileen','June','Lyn','Kay','Alexandra','Rhona','Vicky','Emily','Geraldine','Adele','Jayne','Julia','Nichola','Brenda','Charlotte','Colette','Lyndsey','Beverley','Nicole','Teresa','Joan','Melissa','Morven','Rosemary','Theresa','Annette','Dianne','Moira','Evelyn','Kirstin','Sheila','Vivienne','Agnes','Natasha','Ailsa','Susanne','Clair','Gaynor','Georgina','Kirstie','Sonia','Hilary','Tanya','Debra','Eilidh','Shelley','Bernadette','Carla','Josephine','Dorothy','Marianne','Siobhan','Carrie','Maxine','Sylvia','Alice','Avril','Esther','Hayley','Jan','Janine','Monica','Sheena','Cara','Leona','Rachael','Veronica','Gwen','Tammy','Grace','Heidi','Isla','Johanna','Linzi','Louisa','Kimberley','Lauren','Nina','Vikki','Evonne','Katie','Leah','Rosalind','Wilma','Amy','Ellen','Faye','Jenny','Lara','Lyndsay','Stacey','Ann-Marie','Janette','Joyce','Justine','Vanessa','Alexis','Hannah','Isabella','Sonya','Anne-Marie','Diana','Isobel','Jeanette','Kellie','Kerri','Norma','Tina','Alyson','Annmarie','Joy','Katharine','Kirstine','Lynsay','Nadine','Sheona','Simone','Tara','April','Carol-Ann','Charlene','Dionne','Iona','Isabel','Kara','Karyn','Kate','Kerrie','Lee-Anne','Nadia','Roslyn','Alana','Anita','Collette','Corinne','Doreen','Elspeth','Erica','Flora','Ingrid','Karin','Marilyn','Morna','Roberta','Shonagh','Susannah','Abigail','Andrena','Angie','Dana','Deirdre','Kaye','Lana','Laurie','Linsey','Lynette','Naomi','Rhonda','Rose','Sharron','Vivien','Colleen','Lee-Ann','Marian','Marina','Stella','Annemarie','Anthea','Carolann','Daniela','Johan','Loraine','Margo','Miranda','Miriam','Rona','Roseann','Virginia','Alexandria','Amber','Angeline','Belinda','Bridget','Candice','Carmen','Catrina','Corrina','Gemma','Johanne','Madeleine','Myra','Nancy','Nyree','Penny','Sarah-Jane','Trudi','Vivian','Danielle','Dawna','Faith','Francesca','Helena','Janis','Julie-Ann','Karon','Kimberly','Leeann','Lena','Lois','Luisa','Lynnette','Mari','Penelope','Seonaid','Sharlene','Sheryl','Sonja','Sophie','Tania','Allana','Annabelle','Antonia','Carly','Carol-Anne','Carolanne','Carron','Charmaine','Connie','Donalda','Emma-Jane','Holly','Jackie','Joann','Lea','Lianne','Lucinda','Marjorie','Martha','Philippa','Rhoda','Rowan','Sasha','Senga','Shelly','Susanna','Tamsin','Teri','Tracy-Ann','Allyson','Andrina','Angelina','Annie','Christian','Cindy','Davina','Edith','Estelle','Euphemia','Eva','Eve','Fay','Felicity','Gael','Georgette','Harriet','Jade','Janie','Jeanie','Jenifer','Jocelyn','Jodie','Juliet','Karla','Kerry-Ann','Kirsti','Kristine','Leeanne','Leigh-Ann','Leonie','Lesa','Leslie','Lillian','Marlene','Marlyn','Marnie','Martine','Marysia','Nikki','Noreen','Odette','Phyllis','Rosaleen','Rosalyn','Roseanne','Sacha','Serena','Shauna','Sian','Tammi','Terri','Thomasina','Tricia','Yvette','Zoey','Adrienne','Ainsley','Aline','Amelia','Annabel','Anya','Camilla','Camille','Caren','Carmel','Caron','Caryn','Cecilia','Cherie','Chloe','Corinna','Corrine','Elise','Elsie','Erika','Glenda','Imogen','Inga','Jacqualine','Jacquelyn','Jasmine','Jay','Jessica','Jody','Julianne','Karlyn','Katy','Kendra','Keri','Kym','Lenore','Liza','Luan','Lucille','Lyanne','Marcella','Marcelle','Marissa','Marsha','May','Mechelle','Muriel','Nicola-Jane','Nikola','Olivia','Paulene','Rebekah','Regan','Rosemarie','Rosina','Rosslyn','Saffron','Sally-Ann','Sau','Selena','Selina','Shazia','Tamara','Tammie','Therese','Toni','Ursula','Yolande','Abby','Ailie','Ainslie','Alanna','Anna-Marie','Antoinette','Ashleigh','Aynsley','Beverly','Bianca','Bryony','Caireen','Carolyne','Catharine','Cathryn','Celeste','Celine','Ceri','Charmain','Coleen','Concetta','Constance','Coreen','Corina','Corrinne','Darlene','Donna-Marie','Elinor','Elisabeth','Eliza','Elma','Gabrielle','Georgia','Gina','Glynis','Helene','Henrietta','Isabelle','Janey','Jannette','Jeniffer','Jennie','Jo-Ann','Jodi','Johann','Juliana','Julieanne','Juliette','Karolyn','Karrie','Katriona','Keira','Kelda','Kerryann','Kristina','Kristy','Leasa','Leesa','Leighanne','Leisa','Lesley-Ann','Lesley-Anne','Letitia','Leza','Liane','Lilian','Linsay','Lissa','Lori','Lucia','Lucie','Lydia');
	RETURN word;
END //

DELIMITER //
CREATE FUNCTION `lastName` () RETURNS varchar(100) NOT DETERMINISTIC
BEGIN
	DECLARE word varchar(100);
	SET word = ELT(0.5 + RAND() * 2500, 'Smith','Johnson','Williams','Jones','Brown','Davis','Miller','Wilson','Moore','Taylor','Anderson','Thomas','Jackson','White','Harris','Martin','Thompson','Garcia','Martinez','Robinson','Clark','Rodriguez','Lewis','Lee','Walker','Hall','Allen','Young','Hernandez','King','Wright','Lopez','Hill','Scott','Green','Adams','Baker','Gonzalez','Nelson','Carter','Mitchell','Perez','Roberts','Turner','Phillips','Campbell','Parker','Evans','Edwards','Collins','Stewart','Sanchez','Morris','Rogers','Reed','Cook','Morgan','Bell','Murphy','Bailey','Rivera','Cooper','Richardson','Cox','Howard','Ward','Torres','Peterson','Gray','Ramirez','James','Watson','Brooks','Kelly','Sanders','Price','Bennett','Wood','Barnes','Ross','Henderson','Coleman','Jenkins','Perry','Powell','Long','Patterson','Hughes','Flores','Washington','Butler','Simmons','Foster','Gonzales','Bryant','Alexander','Russell','Griffin','Diaz','Hayes','Myers','Ford','Hamilton','Graham','Sullivan','Wallace','Woods','Cole','West','Jordan','Owens','Reynolds','Fisher','Ellis','Harrison','Gibson','Mcdonald','Cruz','Marshall','Ortiz','Gomez','Murray','Freeman','Wells','Webb','Simpson','Stevens','Tucker','Porter','Hunter','Hicks','Crawford','Henry','Boyd','Mason','Morales','Kennedy','Warren','Dixon','Ramos','Reyes','Burns','Gordon','Shaw','Holmes','Rice','Robertson','Hunt','Black','Daniels','Palmer','Mills','Nichols','Grant','Knight','Ferguson','Rose','Stone','Hawkins','Dunn','Perkins','Hudson','Spencer','Gardner','Stephens','Payne','Pierce','Berry','Matthews','Arnold','Wagner','Willis','Ray','Watkins','Olson','Carroll','Duncan','Snyder','Hart','Cunningham','Bradley','Lane','Andrews','Ruiz','Harper','Fox','Riley','Armstrong','Carpenter','Weaver','Greene','Lawrence','Elliott','Chavez','Sims','Austin','Peters','Kelley','Franklin','Lawson','Fields','Gutierrez','Ryan','Schmidt','Carr','Vasquez','Castillo','Wheeler','Chapman','Oliver','Montgomery','Richards','Williamson','Johnston','Banks','Meyer','Bishop','Mccoy','Howell','Alvarez','Morrison','Hansen','Fernandez','Garza','Harvey','Little','Burton','Stanley','Nguyen','George','Jacobs','Reid','Kim','Fuller','Lynch','Dean','Gilbert','Garrett','Romero','Welch','Larson','Frazier','Burke','Hanson','Day','Mendoza','Moreno','Bowman','Medina','Fowler','Brewer','Hoffman','Carlson','Silva','Pearson','Holland','Douglas','Fleming','Jensen','Vargas','Byrd','Davidson','Hopkins','May','Terry','Herrera','Wade','Soto','Walters','Curtis','Neal','Caldwell','Lowe','Jennings','Barnett','Graves','Jimenez','Horton','Shelton','Barrett','Obrien','Castro','Sutton','Gregory','Mckinney','Lucas','Miles','Craig','Rodriquez','Chambers','Holt','Lambert','Fletcher','Watts','Bates','Hale','Rhodes','Pena','Beck','Newman','Haynes','Mcdaniel','Mendez','Bush','Vaughn','Parks','Dawson','Santiago','Norris','Hardy','Love','Steele','Curry','Powers','Schultz','Barker','Guzman','Page','Munoz','Ball','Keller','Chandler','Weber','Leonard','Walsh','Lyons','Ramsey','Wolfe','Schneider','Mullins','Benson','Sharp','Bowen','Daniel','Barber','Cummings','Hines','Baldwin','Griffith','Valdez','Hubbard','Salazar','Reeves','Warner','Stevenson','Burgess','Santos','Tate','Cross','Garner','Mann','Mack','Moss','Thornton','Dennis','Mcgee','Farmer','Delgado','Aguilar','Vega','Glover','Manning','Cohen','Harmon','Rodgers','Robbins','Newton','Todd','Blair','Higgins','Ingram','Reese','Cannon','Strickland','Townsend','Potter','Goodwin','Walton','Rowe','Hampton','Ortega','Patton','Swanson','Joseph','Francis','Goodman','Maldonado','Yates','Becker','Erickson','Hodges','Rios','Conner','Adkins','Webster','Norman','Malone','Hammond','Flowers','Cobb','Moody','Quinn','Blake','Maxwell','Pope','Floyd','Osborne','Paul','Mccarthy','Guerrero','Lindsey','Estrada','Sandoval','Gibbs','Tyler','Gross','Fitzgerald','Stokes','Doyle','Sherman','Saunders','Wise','Colon','Gill','Alvarado','Greer','Padilla','Simon','Waters','Nunez','Ballard','Schwartz','Mcbride','Houston','Christensen','Klein','Pratt','Briggs','Parsons','Mclaughlin','Zimmerman','French','Buchanan','Moran','Copeland','Roy','Pittman','Brady','Mccormick','Holloway','Brock','Poole','Frank','Logan','Owen','Bass','Marsh','Drake','Wong','Jefferson','Park','Morton','Abbott','Sparks','Patrick','Norton','Huff','Clayton','Massey','Lloyd','Figueroa','Carson','Bowers','Roberson','Barton','Tran','Lamb','Harrington','Casey','Boone','Cortez','Clarke','Mathis','Singleton','Wilkins','Cain','Bryan','Underwood','Hogan','Mckenzie','Collier','Luna','Phelps','Mcguire','Allison','Bridges','Wilkerson','Nash','Summers','Atkins','Wilcox','Pitts','Conley','Marquez','Burnett','Richard','Cochran','Chase','Davenport','Hood','Gates','Clay','Ayala','Sawyer','Roman','Vazquez','Dickerson','Hodge','Acosta','Flynn','Espinoza','Nicholson','Monroe','Wolf','Morrow','Kirk','Randall','Anthony','Whitaker','Oconnor','Skinner','Ware','Molina','Kirby','Huffman','Bradford','Charles','Gilmore','Dominguez','Oneal','Bruce','Lang','Combs','Kramer','Heath','Hancock','Gallagher','Gaines','Shaffer','Short','Wiggins','Mathews','Mcclain','Fischer','Wall','Small','Melton','Hensley','Bond','Dyer','Cameron','Grimes','Contreras','Christian','Wyatt','Baxter','Snow','Mosley','Shepherd','Larsen','Hoover','Beasley','Glenn','Petersen','Whitehead','Meyers','Keith','Garrison','Vincent','Shields','Horn','Savage','Olsen','Schroeder','Hartman','Woodard','Mueller','Kemp','Deleon','Booth','Patel','Calhoun','Wiley','Eaton','Cline','Navarro','Harrell','Lester','Humphrey','Parrish','Duran','Hutchinson','Hess','Dorsey','Bullock','Robles','Beard','Dalton','Avila','Vance','Rich','Blackwell','York','Johns','Blankenship','Trevino','Salinas','Campos','Pruitt','Moses','Callahan','Golden','Montoya','Hardin','Guerra','Mcdowell','Carey','Stafford','Gallegos','Henson','Wilkinson','Booker','Merritt','Miranda','Atkinson','Orr','Decker','Hobbs','Preston','Tanner','Knox','Pacheco','Stephenson','Glass','Rojas','Serrano','Marks','Hickman','English','Sweeney','Strong','Prince','Mcclure','Conway','Walter','Roth','Maynard','Farrell','Lowery','Hurst','Nixon','Weiss','Trujillo','Ellison','Sloan','Juarez','Winters','Mclean','Randolph','Leon','Boyer','Villarreal','Mccall','Gentry','Carrillo','Kent','Ayers','Lara','Shannon','Sexton','Pace','Hull','Leblanc','Browning','Velasquez','Leach','Chang','House','Sellers','Herring','Noble','Foley','Bartlett','Mercado','Landry','Durham','Walls','Barr','Mckee','Bauer','Rivers','Everett','Bradshaw','Pugh','Velez','Rush','Estes','Dodson','Morse','Sheppard','Weeks','Camacho','Bean','Barron','Livingston','Middleton','Spears','Branch','Blevins','Chen','Kerr','Mcconnell','Hatfield','Harding','Ashley','Solis','Herman','Frost','Giles','Blackburn','William','Pennington','Woodward','Finley','Mcintosh','Koch','Best','Solomon','Mccullough','Dudley','Nolan','Blanchard','Rivas','Brennan','Mejia','Kane','Benton','Joyce','Buckley','Haley','Valentine','Maddox','Russo','Mcknight','Buck','Moon','Mcmillan','Crosby','Berg','Dotson','Mays','Roach','Church','Chan','Richmond','Meadows','Faulkner','Oneill','Knapp','Kline','Barry','Ochoa','Jacobson','Gay','Avery','Hendricks','Horne','Shepard','Hebert','Cherry','Cardenas','Mcintyre','Whitney','Waller','Holman','Donaldson','Cantu','Terrell','Morin','Gillespie','Fuentes','Tillman','Sanford','Bentley','Peck','Key','Salas','Rollins','Gamble','Dickson','Battle','Santana','Cabrera','Cervantes','Howe','Hinton','Hurley','Spence','Zamora','Yang','Mcneil','Suarez','Case','Petty','Gould','Mcfarland','Sampson','Carver','Bray','Rosario','Macdonald','Stout','Hester','Melendez','Dillon','Farley','Hopper','Galloway','Potts','Bernard','Joyner','Stein','Aguirre','Osborn','Mercer','Bender','Franco','Rowland','Sykes','Benjamin','Travis','Pickett','Crane','Sears','Mayo','Dunlap','Hayden','Wilder','Mckay','Coffey','Mccarty','Ewing','Cooley','Vaughan','Bonner','Cotton','Holder','Stark','Ferrell','Cantrell','Fulton','Lynn','Lott','Calderon','Rosa','Pollard','Hooper','Burch','Mullen','Fry','Riddle','Levy','David','Duke','Odonnell','Guy','Michael','Britt','Frederick','Daugherty','Berger','Dillard','Alston','Jarvis','Frye','Riggs','Chaney','Odom','Duffy','Fitzpatrick','Valenzuela','Merrill','Mayer','Alford','Mcpherson','Acevedo','Donovan','Barrera','Albert','Cote','Reilly','Compton','Raymond','Mooney','Mcgowan','Craft','Cleveland','Clemons','Wynn','Nielsen','Baird','Stanton','Snider','Rosales','Bright','Witt','Stuart','Hays','Holden','Rutledge','Kinney','Clements','Castaneda','Slater','Hahn','Emerson','Conrad','Burks','Delaney','Pate','Lancaster','Sweet','Justice','Tyson','Sharpe','Whitfield','Talley','Macias','Irwin','Burris','Ratliff','Mccray','Madden','Kaufman','Beach','Goff','Cash','Bolton','Mcfadden','Levine','Good','Byers','Kirkland','Kidd','Workman','Carney','Dale','Mcleod','Holcomb','England','Finch','Head','Burt','Hendrix','Sosa','Haney','Franks','Sargent','Nieves','Downs','Rasmussen','Bird','Hewitt','Lindsay','Le','Foreman','Valencia','Oneil','Delacruz','Vinson','Dejesus','Hyde','Forbes','Gilliam','Guthrie','Wooten','Huber','Barlow','Boyle','Mcmahon','Buckner','Rocha','Puckett','Langley','Knowles','Cooke','Velazquez','Whitley','Noel','Vang','Shea','Rouse','Hartley','Mayfield','Elder','Rankin','Hanna','Cowan','Lucero','Arroyo','Slaughter','Haas','Oconnell','Minor','Kendrick','Shirley','Kendall','Boucher','Archer','Boggs','Odell','Dougherty','Andersen','Newell','Crowe','Wang','Friedman','Bland','Swain','Holley','Felix','Pearce','Childs','Yarbrough','Galvan','Proctor','Meeks','Lozano','Mora','Rangel','Bacon','Villanueva','Schaefer','Rosado','Helms','Boyce','Goss','Stinson','Smart','Lake','Ibarra','Hutchins','Covington','Reyna','Gregg','Werner','Crowley','Hatcher','Mackey','Bunch','Womack','Polk','Jamison','Dodd','Childress','Childers','Camp','Villa','Dye','Springer','Mahoney','Dailey','Belcher','Lockhart','Griggs','Costa','Connor','Brandt','Winter','Walden','Moser','Tracy','Tatum','Mccann','Akers','Lutz','Pryor','Law','Orozco','Mcallister','Lugo','Davies','Shoemaker','Madison','Rutherford','Newsome','Magee','Chamberlain','Blanton','Simms','Godfrey','Flanagan','Crum','Cordova','Escobar','Downing','Sinclair','Donahue','Krueger','Mcginnis','Gore','Farris','Webber','Corbett','Andrade','Starr','Lyon','Yoder','Hastings','Mcgrath','Spivey','Krause','Harden','Crabtree','Kirkpatrick','Hollis','Brandon','Arrington','Ervin','Clifton','Ritter','Mcghee','Bolden','Maloney','Gagnon','Dunbar','Ponce','Pike','Mayes','Heard','Beatty','Mobley','Kimball','Butts','Montes','Herbert','Grady','Eldridge','Braun','Hamm','Gibbons','Seymour','Moyer','Manley','Herron','Plummer','Elmore','Cramer','Gary','Rucker','Hilton','Blue','Pierson','Fontenot','Field','Rubio','Grace','Goldstein','Elkins','Wills','Novak','John','Hickey','Worley','Gorman','Katz','Dickinson','Broussard','Fritz','Woodruff','Crow','Christopher','Britton','Forrest','Nance','Lehman','Bingham','Zuniga','Whaley','Shafer','Coffman','Steward','Delarosa','Nix','Neely','Numbers','Mata','Manuel','Davila','Mccabe','Kessler','Emery','Bowling','Hinkle','Welsh','Pagan','Goldberg','Goins','Crouch','Cuevas','Quinones','Mcdermott','Hendrickson','Samuels','Denton','Bergeron','Lam','Ivey','Locke','Haines','Thurman','Snell','Hoskins','Byrne','Milton','Winston','Arthur','Arias','Stanford','Roe','Corbin','Beltran','Chappell','Hurt','Downey','Dooley','Tuttle','Couch','Payton','Mcelroy','Crockett','Groves','Clement','Leslie','Cartwright','Dickey','Mcgill','Dubois','Muniz','Erwin','Self','Tolbert','Dempsey','Cisneros','Sewell','Latham','Garland','Vigil','Tapia','Sterling','Rainey','Norwood','Lacy','Stroud','Meade','Amos','Tipton','Lord','Kuhn','Hilliard','Bonilla','Teague','Courtney','Gunn','Ho','Greenwood','Correa','Reece','Weston','Poe','Trent','Pineda','Phipps','Frey','Kaiser','Ames','Paige','Gunter','Schmitt','Milligan','Espinosa','Carlton','Bowden','Vickers','Lowry','Pritchard','Costello','Piper','Mcclellan','Lovell','Drew','Sheehan','Quick','Hatch','Dobson','Singh','Jeffries','Hollingsworth','Sorensen','Meza','Fink','Donnelly','Burrell','Bruno','Tomlinson','Colbert','Billings','Ritchie','Helton','Sutherland','Peoples','Mcqueen','Gaston','Thomason','Mckinley','Givens','Crocker','Vogel','Robison','Dunham','Coker','Swartz','Keys','Lilly','Ladner','Hannah','Willard','Richter','Hargrove','Edmonds','Brantley','Albright','Murdock','Boswell','Muller','Quintero','Padgett','Kenney','Daly','Connolly','Pierre','Inman','Quintana','Lund','Barnard','Villegas','Simons','Land','Huggins','Tidwell','Sanderson','Bullard','Mcclendon','Duarte','Draper','Meredith','Marrero','Dwyer','Abrams','Stover','Goode','Fraser','Crews','Bernal','Smiley','Godwin','Fish','Conklin','Mcneal','Baca','Esparza','Crowder','Bower','Nicholas','Chung','Brewster','Mcneill','Dick','Rodrigues','Leal','Coates','Raines','Mccain','Mccord','Miner','Holbrook','Swift','Dukes','Carlisle','Aldridge','Ackerman','Starks','Ricks','Holliday','Ferris','Hairston','Sheffield','Lange','Fountain','Marino','Doss','Betts','Kaplan','Carmichael','Bloom','Ruffin','Penn','Kern','Bowles','Sizemore','Larkin','Dupree','Jewell','Silver','Seals','Metcalf','Hutchison','Henley','Farr','Castle','Mccauley','Hankins','Gustafson','Deal','Curran','Ash','Waddell','Ramey','Cates','Pollock','Major','Irvin','Cummins','Messer','Heller','Dewitt','Lin','Funk','Cornett','Palacios','Galindo','Cano','Hathaway','Singer','Pham','Enriquez','Aaron','Salgado','Pelletier','Painter','Wiseman','Blount','Hand','Feliciano','Temple','Houser','Doherty','Mead','Mcgraw','Toney','Swan','Melvin','Capps','Blanco','Blackmon','Wesley','Thomson','Mcmanus','Fair','Burkett','Post','Gleason','Rudolph','Ott','Dickens','Cormier','Voss','Rushing','Rosenberg','Hurd','Dumas','Benitez','Arellano','Story','Marin','Caudill','Bragg','Jaramillo','Huerta','Gipson','Colvin','Biggs','Vela','Platt','Cassidy','Tompkins','Mccollum','Kay','Gabriel','Dolan','Daley','Crump','Street','Sneed','Kilgore','Grove','Grimm','Davison','Brunson','Prater','Marcum','Devine','Kyle','Dodge','Stratton','Rosas','Choi','Tripp','Ledbetter','Lay','Hightower','Haywood','Feldman','Epps','Yeager','Posey','Sylvester','Scruggs','Cope','Stubbs','Richey','Overton','Trotter','Sprague','Cordero','Butcher','Burger','Stiles','Burgos','Woodson','Horner','Bassett','Purcell','Haskins','Gee','Akins','Abraham','Hoyt','Ziegler','Spaulding','Hadley','Grubbs','Sumner','Murillo','Zavala','Shook','Lockwood','Jarrett','Driscoll','Dahl','Thorpe','Sheridan','Redmond','Putnam','Mcwilliams','Mcrae','Cornell','Felton','Romano','Joiner','Sadler','Hedrick','Hager','Hagen','Fitch','Coulter','Thacker','Mansfield','Langston','Guidry','Ferreira','Corley','Conn','Rossi','Lackey','Cody','Baez','Saenz','Mcnamara','Darnell','Michel','Mcmullen','Mckenna','Mcdonough','Link','Engel','Browne','Roper','Peacock','Eubanks','Drummond','Stringer','Pritchett','Parham','Mims','Landers','Ham','Grayson','Stacy','Schafer','Egan','Timmons','Ohara','Keen','Hamlin','Finn','Cortes','Mcnair','Louis','Clifford','Nadeau','Moseley','Michaud','Rosen','Oakes','Kurtz','Jeffers','Calloway','Beal','Bautista','Winn','Suggs','Stern','Stapleton','Lyles','Laird','Montano','Diamond','Dawkins','Roland','Hagan','Goldman','Bryson','Barajas','Lovett','Segura','Metz','Lockett','Langford','Hinson','Eastman','Rock','Hooks','Woody','Smallwood','Shapiro','Crowell','Whalen','Triplett','Hooker','Chatman','Aldrich','Cahill','Youngblood','Ybarra','Stallings','Sheets','Samuel','Reeder','Person','Pack','Lacey','Connelly','Bateman','Abernathy','Winkler','Wilkes','Masters','Hackett','Granger','Gillis','Schmitz','Sapp','Napier','Souza','Lanier','Gomes','Weir','Otero','Ledford','Burroughs','Babcock','Ventura','Siegel','Dugan','Clinton','Christie','Bledsoe','Atwood','Wray','Varner','Spangler','Otto','Anaya','Staley','Kraft','Fournier','Eddy','Belanger','Wolff','Thorne','Bynum','Burnette','Boykin','Swenson','Purvis','Pina','Khan','Duvall','Darby','Xiong','Kauffman','Ali','Yu','Healy','Engle','Corona','Benoit','Valle','Steiner','Spicer','Shaver','Randle','Lundy','Dow','Chin','Calvert','Staton','Neff','Kearney','Darden','Oakley','Medeiros','Mccracken','Crenshaw','Block','Beaver','Perdue','Dill','Whittaker','Tobin','Cornelius','Washburn','Hogue','Goodrich','Easley','Bravo','Dennison','Vera','Shipley','Kerns','Jorgensen','Crain','Abel','Villalobos','Maurer','Longoria','Keene','Coon','Sierra','Witherspoon','Staples','Pettit','Kincaid','Eason','Madrid','Echols','Lusk','Wu','Stahl','Currie','Thayer','Shultz','Sherwood','Mcnally','Seay','North','Maher','Kenny','Hope','Gagne','Barrow','Nava','Myles','Moreland','Honeycutt','Hearn','Diggs','Caron','Whitten','Westbrook','Stovall','Ragland','Queen','Munson','Meier','Looney','Kimble','Jolly','Hobson','London','Goddard','Culver','Burr','Presley','Negron','Connell','Tovar','Marcus','Huddleston','Hammer','Ashby','Salter','Root','Pendleton','Oleary','Nickerson','Myrick','Judd','Jacobsen','Elliot','Bain','Adair','Starnes','Sheldon','Matos','Light','Busby','Herndon','Hanley','Bellamy','Jack','Doty','Bartley','Yazzie','Rowell','Parson','Gifford','Cullen','Christiansen','Benavides','Barnhart','Talbot','Mock','Crandall','Connors','Bonds','Whitt','Gage','Bergman','Arredondo','Addison','Marion','Lujan','Dowdy','Jernigan','Huynh','Bouchard','Dutton','Rhoades','Ouellette','Kiser','Rubin','Herrington','Hare','Denny','Blackman','Babb','Allred','Rudd','Paulson','Ogden','Koenig','Jacob','Irving','Geiger','Begay','Parra','Champion','Lassiter','Hawk','Esposito','Cho','Waldron','Vernon','Ransom','Prather','Keenan','Jean','Grover','Chacon','Vick','Sands','Roark','Parr','Mayberry','Greenberg','Coley','Bruner','Whitman','Skaggs','Shipman','Means','Leary','Hutton','Romo','Medrano','Ladd','Kruse','Friend','Darling','Askew','Valentin','Schulz','Alfaro','Tabor','Mohr','Gallo','Bermudez','Pereira','Isaac','Bliss','Reaves','Flint','Comer','Boston','Woodall','Naquin','Guevara','Earl','Delong','Carrier','Pickens','Brand','Tilley','Schaffer','Read','Lim','Knutson','Fenton','Doran','Chu','Vogt','Vann','Prescott','Mclain','Landis','Corcoran','Ambrose','Zapata','Hyatt','Hemphill','Faulk','Call','Dove','Boudreaux','Aragon','Whitlock','Trejo','Tackett','Shearer','Saldana','Hanks','Gold','Driver','Mckinnon','Koehler','Champagne','Bourgeois','Pool','Keyes','Goodson','Foote','Early','Lunsford','Goldsmith','Flood','Winslow','Sams','Reagan','Mccloud','Hough','Esquivel','Naylor','Loomis','Coronado','Ludwig','Braswell','Bearden','Sherrill','Huang','Fagan','Ezell','Edmondson','Cyr','Cronin','Nunn','Lemon','Guillory','Grier','Dubose','Traylor','Ryder','Dobbins','Coyle','Aponte','Whitmore','Smalls','Rowan','Malloy','Cardona','Braxton','Borden','Humphries','Carrasco','Ruff','Metzger','Huntley','Hinojosa','Finney','Madsen','Hong','Hills','Ernst','Dozier','Burkhart','Bowser','Peralta','Daigle','Whittington','Sorenson','Saucedo','Roche','Redding','Loyd','Fugate','Avalos','Waite','Lind','Huston','Hay','Benedict','Hawthorne','Hamby','Boyles','Boles','Regan','Faust','Crook','Beam','Barger','Hinds','Gallardo','Elias','Willoughby','Willingham','Wilburn','Eckert','Busch','Zepeda','Worthington','Tinsley','Russ','Li','Hoff','Hawley','Carmona','Varela','Rector','Newcomb','Mallory','Kinsey','Dube','Whatley','Strange','Ragsdale','Ivy','Bernstein','Becerra','Yost','Mattson','Ly','Felder','Cheek','Luke','Handy','Grossman','Gauthier','Escobedo','Braden','Beckman','Mott','Hillman','Gil','Flaherty','Dykes','Doe','Stockton','Stearns','Lofton','Kitchen','Coats','Cavazos','Beavers','Barrios','Tang','Parish','Mosher','Lincoln','Cardwell','Coles','Burnham','Weller','Lemons','Beebe','Aguilera','Ring','Parnell','Harman','Couture','Alley','Schumacher','Redd','Dobbs','Blum','Blalock','Merchant','Ennis','Denson','Cottrell','Chester','Brannon','Bagley','Aviles','Watt','Sousa','Rosenthal','Rooney','Dietz','Blank','Paquette','Mcclelland','Duff','Velasco','Lentz','Grubb','Burrows','Barbour','Ulrich','Shockley','Rader','German','Beyer','Mixon','Layton','Altman','Alonzo','Weathers','Titus','Stoner','Squires','Shipp','Priest','Lipscomb','Cutler','Caballero','Zimmer','Willett','Thurston','Storey','Medley','Lyle','Epperson','Shah','Mcmillian','Baggett','Torrez','Laws','Hirsch','Dent','Corey','Poirier','Peachey','Jacques','Farrar','Creech','Barth','Trimble','France','Dupre','Albrecht','Sample','Lawler','Crisp','Conroy','Chadwick','Wetzel','Nesbitt','Murry','Jameson','Wilhelm','Patten','Minton','Matson','Kimbrough','Iverson','Guinn','Gale','Fortune','Croft','Toth','Pulliam','Nugent','Newby','Littlejohn','Dias','Canales','Bernier','Baron','Barney','Singletary','Renteria','Pruett','Mchugh','Mabry','Landrum','Brower','Weldon','Stoddard','Ruth','Cagle','Stjohn','Scales','Kohler','Kellogg','Hopson','Gant','Tharp','Gann','Zeigler','Pringle','Hammons','Fairchild','Deaton','Chavis','Carnes','Rowley','Matlock','Libby','Kearns','Irizarry','Carrington','Starkey','Pepper','Lopes','Jarrell','Fay','Craven','Beverly','Baum','Spain','Littlefield','Linn','Humphreys','Hook','High','Etheridge','Cuellar','Chastain','Chance','Bundy','Speer','Skelton','Quiroz','Pyle','Portillo','Ponder','Moulton','Machado','Liu','Killian','Hutson','Hitchcock','Ellsworth','Dowling','Cloud','Burdick','Spann','Pedersen','Levin','Leggett','Hayward','Hacker','Dietrich','Beaulieu','Barksdale','Wakefield','Snowden','Paris','Briscoe','Bowie','Berman','Ogle','Mcgregor','Laughlin','Helm','Burden','Wheatley','Schreiber','Pressley','Parris','Ng','Alaniz','Agee','Urban','Swann','Snodgrass','Schuster','Radford','Monk','Mattingly','Main','Lamar','Harp','Girard','Cheney','Yancey','Wagoner','Ridley','Lombardo','Lau','Hudgins','Gaskins','Duckworth','Coe','Coburn','Willey','Prado','Newberry','Magana','Hammonds','Elam','Whipple','Slade','Serna','Ojeda','Liles','Dorman','Diehl','Angel','Upton','Reardon','Michaels','Kelsey','Goetz','Eller','Bauman','Baer','Augustine','Layne','Hummel','Brenner','Amaya','Adamson','Ornelas','Dowell','Cloutier','Christy','Castellanos','Wing','Wellman','Saylor','Orourke','Moya','Montalvo','Kilpatrick','Harley','Durbin','Shell','Oldham','Kang','Garvin','Foss','Branham','Bartholomew','Templeton','Maguire','Holton','Alonso','Rider','Monahan','Mccormack','Beaty','Anders','Streeter','Nieto','Nielson','Moffett','Lankford','Keating','Heck','Gatlin','Delatorre','Callaway','Adcock','Worrell','Unger','Robinette','Nowak','Jeter','Brunner','Ashton','Steen','Parrott','Overstreet','Nobles','Montanez','Luther','Clevenger','Brinkley','Trahan','Quarles','Pickering','Pederson','Jansen','Grantham','Gilchrist','Crespo','Aiken','Schell','Schaeffer','Lorenz','Leyva','Harms','Dyson','Wallis','Pease','Leavitt','Hyman','Cheng','Cavanaugh','Batts','Warden','Seaman','Rockwell','Quezada','Paxton','Linder','Houck','Fontaine','Durant','Caruso','Adler','Pimentel','Mize','Lytle','Donald','Cleary','Cason','Acker','Switzer','Salmon','Isaacs','Higginbotham','Han','Waterman','Vandyke','Stamper','Sisk','Shuler','Riddick','Redman','Mcmahan','Levesque','Hatton','Bronson','Bollinger','Arnett','Okeefe','Gerber');
	RETURN (word);
END //
DELIMITER ;

-- 0.5.1

ALTER TABLE `user` ADD COLUMN `fb_token` varchar(255) DEFAULT NULL;
ALTER TABLE `user` ADD COLUMN `gplus_token` varchar(255) DEFAULT NULL;

-- 0.5.2

UPDATE `user` SET `handle`=LOWER(`handle`), `email`=LOWER(`email`) WHERE 1;

DELIMITER //
CREATE TRIGGER user_insert_lower BEFORE INSERT ON `user`
FOR EACH ROW BEGIN
	SET NEW.handle = LOWER(NEW.handle);
	SET NEW.email = LOWER(NEW.email);
END //
DELIMITER ;

DELIMITER //
CREATE TRIGGER user_update_lower BEFORE UPDATE ON `user`
FOR EACH ROW BEGIN
	SET NEW.handle = LOWER(NEW.handle);
	SET NEW.email = LOWER(NEW.email);
END //
DELIMITER ;

-- 0.5.3

ALTER TABLE `yoller_type` ADD COLUMN `img_url` varchar(50) NOT NULL;
UPDATE `yoller_type` SET `img_url`='play.png' WHERE `label`='Play';
UPDATE `yoller_type` SET `img_url`='gig.png' WHERE `label`='Gig';
UPDATE `yoller_type` SET `img_url`='party.png' WHERE `label`='Party';
UPDATE `yoller_type` SET `img_url`='stand-up.png' WHERE `label`='Stand-up Show';
UPDATE `yoller_type` SET `img_url`='video.png' WHERE `label`='Video';
UPDATE `yoller_type` SET `img_url`='play-script.png' WHERE `label`='Play Script';
UPDATE `yoller_type` SET `img_url`='gallery.png' WHERE `label`='Gallery';

-- 0.5.4

ALTER TABLE `user` ADD COLUMN `twitter_token` varchar(255) DEFAULT NULL;

-- 0.5.5

ALTER TABLE `yoller_type` ADD COLUMN `short` varchar(4) NOT NULL DEFAULT 'aaa';
UPDATE `yoller_type` SET `short`='play' WHERE `label`='Play';
UPDATE `yoller_type` SET `short`='gig' WHERE `label`='Gig';
UPDATE `yoller_type` SET `short`='prty' WHERE `label`='Party';
UPDATE `yoller_type` SET `short`='stnd' WHERE `label`='Stand-up Show';
UPDATE `yoller_type` SET `short`='vid' WHERE `label`='Video';
UPDATE `yoller_type` SET `short`='scpt' WHERE `label`='Play Script';
UPDATE `yoller_type` SET `short`='glry' WHERE `label`='Gallery';

-- 0.5.6

ALTER TABLE `yoller_type` DROP COLUMN `img_url`;

-- 0.5.7

ALTER TABLE `custom_role` CHANGE COLUMN `name` `label` varchar(50) NOT NULL;

-- 0.5.8

ALTER TABLE `user_group_membership` CHANGE COLUMN `label` `role_id` int unsigned DEFAULT NULL;
ALTER TABLE `user_group_membership` ADD CONSTRAINT FOREIGN KEY (`role_id`) REFERENCES `role` (`id`) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE `user_group_membership` ADD COLUMN `custom_role_id` int unsigned DEFAULT NULL;
ALTER TABLE `user_group_membership` ADD CONSTRAINT FOREIGN KEY (`custom_role_id`) REFERENCES `custom_role` (`id`) ON UPDATE CASCADE ON DELETE SET NULL;

-- 0.6.0

ALTER TABLE `role` ADD COLUMN `custom` TINYINT(1) NOT NULL DEFAULT 1;
ALTER TABLE `role` ADD COLUMN `repeat` INT UNSIGNED NOT NULL DEFAULT 0;
INSERT INTO `role` (`label`, `custom`, `repeat`) SELECT `label`, 1, 1 FROM `custom_role`;
ALTER TABLE `section_active_role` DROP FOREIGN KEY `section_active_role_ibfk_4`;
ALTER TABLE `section_active_role` DROP COLUMN `custom_role_id`;
ALTER TABLE `user_group_membership` DROP FOREIGN KEY `user_group_membership_ibfk_4`;
ALTER TABLE `user_group_membership` DROP COLUMN `custom_role_id`;
DROP TABLE `custom_role`;
ALTER TABLE `yoller_section` DROP FOREIGN KEY `yoller_section_ibfk_2`;
ALTER TABLE `yoller_section` DROP COLUMN `yoller_occurrence_id`;
ALTER TABLE `section_active_role` ADD COLUMN `yoller_occurrence_id` INT UNSIGNED DEFAULT NULL;

DROP PROCEDURE IF EXISTS `createYollerCollab`;
DELIMITER //
CREATE PROCEDURE `createYollerCollab` (IN ysID INT, IN collabNum INT)
BEGIN
	INSERT INTO `section_active_role` (yoller_section_id, active_id, role_id, `order`) VALUES
		(ysID,
			(SELECT `id` FROM `active` ORDER BY RAND() LIMIT 1),
			(SELECT `id` FROM `role` ORDER BY RAND() LIMIT 1), collabNum);
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS `createYollerSection`;
DELIMITER //
CREATE PROCEDURE `createYollerSection` (IN yollerID INT, IN sectionNum INT)
BEGIN
	DECLARE ysName varchar(100);
	DECLARE numCollabs, ysID INT;
	SET ysName = ELT(0.5 + RAND() * 10, 'Cast', 'People Who Did Things', 'Extras', 'Undesirables', 'Desirables', 'Those Who Watched', 'Special Thanks To', 'People Who Might Have Done Something', 'Offsite Help', 'Others');
	INSERT INTO `yoller_section` (yoller_id, `name`, `order`) VALUES (yollerID, ysName, sectionNum);
	SET ysID = LAST_INSERT_ID();
	SET numCollabs = randNumber(2, 14);
	WHILE numCollabs > 0 DO
		CALL createYollerCollab(ysID, numCollabs);
		SET numCollabs = numCollabs - 1;
	END WHILE;
END //
DELIMITER ;

-- 0.6.1

UPDATE `role` SET `custom`=0 WHERE 1;

-- 0.6.2

ALTER TABLE `user_group_membership` CHANGE COLUMN `confirmed` `user_confirmed` TINYINT(1) NOT NULL DEFAULT 0;
ALTER TABLE `user_group_membership` ADD COLUMN `group_confirmed` TINYINT(1) NOT NULL DEFAULT 0;

-- 0.6.3

CREATE INDEX `user_group_membership_start_time` ON `user_group_membership` (`start_time`);
CREATE INDEX `user_group_membership_end_time` ON `user_group_membership` (`end_time`);
CREATE TABLE `url_alias` (
	`id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`from` VARCHAR(12) NOT NULL,
	`to` VARCHAR(200) NOT NULL,
	UNIQUE (`from`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 0.6.4

CREATE TABLE `pending_message` (
	`id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`user_id` int(10) UNSIGNED NOT NULL,
	`type` enum('email', 'text') NOT NULL,
	`subject` TEXT DEFAULT NULL,
	`body` TEXT NOT NULL,
	`force_send` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 0.6.5

ALTER TABLE `pending_message` ADD COLUMN `url` TEXT NOT NULL;
ALTER TABLE `photo` DROP COLUMN `blob_id`;

-- 0.6.6

ALTER TABLE `pending_message` ADD CONSTRAINT FOREIGN KEY (`user_id`) REFERENCES `user` (`id`);

-- 0.6.7

CREATE INDEX `url_alias_to` ON `url_alias` (`to`);
CREATE TABLE `url_alias_visit` (
    `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `url_alias_id` int(10) UNSIGNED NOT NULL,
    `time` timestamp DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
ALTER TABLE `url_alias_visit` ADD CONSTRAINT FOREIGN KEY (`url_alias_id`) REFERENCES `url_alias` (`id`);

-- 0.6.8

ALTER TABLE `photo` ADD COLUMN `url` TEXT DEFAULT NULL;
ALTER TABLE `photo` ADD COLUMN `extension` VARCHAR(5) DEFAULT NULL;
ALTER TABLE `photo` DROP COLUMN `height`;
ALTER TABLE `photo` DROP COLUMN `width`;

-- 0.7.0

INSERT INTO `role` (`label`, `parent_role_id`, `custom`, `repeat`) VALUES
	('Host', NULL, 0, 0),
	('Producer', NULL, 0, 0);
INSERT INTO `role` (`label`, `parent_role_id`, `custom`, `repeat`) VALUES ('Manager', NULL, 0, 0);
SET @managerID := LAST_INSERT_ID();
INSERT INTO `role` (`label`, `parent_role_id`, `custom`, `repeat`) VALUES ('Stage Manager', @managerID, 0, 0);
SET @stageManagerID := LAST_INSERT_ID();
INSERT INTO `role` (`label`, `parent_role_id`, `custom`, `repeat`) VALUES ('Assistant Stage Manager', @stageManagerID, 0, 0);
INSERT INTO `role` (`label`, `parent_role_id`, `custom`, `repeat`) VALUES ('Production Manager', @managerID, 0, 0);
SET @productionManagerID := LAST_INSERT_ID();
INSERT INTO `role` (`label`, `parent_role_id`, `custom`, `repeat`) VALUES ('Assistant Production Manager', @productionManagerID, 0, 0);
INSERT INTO `role` (`label`, `parent_role_id`, `custom`, `repeat`) VALUES ('Designer', NULL, 0, 0);
SET @designerID := LAST_INSERT_ID();
SELECT `id` INTO @musicionID FROM `role` WHERE `label`='Musician' AND `custom`=0 AND `parent_role_id` IS NULL;
INSERT INTO `role` (`label`, `parent_role_id`, `custom`, `repeat`) VALUES
	('Scenic Designer', @designerID, 0, 0), ('Sound Designer', @designerID, 0, 0),
	('Costume Designer', @designerID, 0, 0), ('Lighting Designer', @designerID, 0, 0),
	('Ukelele', @musicianID, 0, 0);
INSERT INTO `role` (`label`, `parent_role_id`, `custom`, `repeat`) VALUES ('Dancer', NULL, 0, 0);
SET @dancerID := LAST_INSERT_ID();
INSERT INTO `role` (`label`, `parent_role_id`, `custom`, `repeat`) VALUES
	('Dance Captain', @dancerID, 0, 0), ('Choreographer', NULL, 0, 0);
INSERT INTO `role` (`label`, `parent_role_id`, `custom`, `repeat`) VALUES ('Camera Work', NULL, 0, 0);
SET @cameraID := LAST_INSERT_ID();
INSERT INTO `role` (`label`, `parent_role_id`, `custom`, `repeat`) VALUES
	('Videographer', @cameraID, 0, 0), ('Photographer', @cameraID, 0, 0);
INSERT INTO `role` (`label`, `parent_role_id`, `custom`, `repeat`) VALUES ('Post-Production', NULL, 0, 0);
SET @postID := LAST_INSERT_ID();
INSERT INTO `role` (`label`, `parent_role_id`, `custom`, `repeat`) VALUES ('Video Editor', @postID, 0, 0);

-- 0.7.1

SELECT `id` INTO @managerID FROM `role` WHERE `custom`=0 AND `label`='Manager' AND `parent_role_id` IS NULL;
INSERT INTO `role` (`label`, `parent_role_id`, `custom`, `repeat`) VALUES ('Theatrical Manager', @managerID, 0, 0);
SET @tManagerID := LAST_INSERT_ID();
UPDATE `role` SET `parent_role_id`=@tManagerID WHERE `label` IN ('Production Manager', 'Stage Manager');

-- 0.7.2

ALTER TABLE `sent_email` ADD COLUMN `email` varchar(100) NOT NULL;
CREATE TABLE `pending_email_change` (
	`id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`user_id` int(10) UNSIGNED NOT NULL,
	`email` varchar(100) NOT NULL,
	`code` char(50) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
ALTER TABLE `user` CHANGE COLUMN `email` `email` varchar(100) DEFAULT NULL;
CREATE TABLE `pending_phone_change` (
	`id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`user_id` int(10) UNSIGNED NOT NULL,
	`phone` varchar(12) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
CREATE TABLE `pending_password_reset` (
	`id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`user_id` int(10) UNSIGNED NOT NULL,
	`code` char(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 0.7.2.1

ALTER TABLE `pending_email_change` ADD COLUMN `timestamp` timestamp DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE `pending_phone_change` ADD COLUMN `timestamp` timestamp DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE `pending_password_reset` ADD COLUMN `timestamp` timestamp DEFAULT CURRENT_TIMESTAMP;

-- 0.7.3

ALTER TABLE `pending_email_change` DROP FOREIGN KEY `pending_email_change_ibfk_1`;
ALTER TABLE `pending_email_change` ADD CONSTRAINT FOREIGN KEY `pending_email_change_ibfk_1` (`user_id`) REFERENCES `user` (`id`) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE `pending_message` DROP FOREIGN KEY `pending_message_ibfk_1`;
ALTER TABLE `pending_message` ADD CONSTRAINT FOREIGN KEY `pending_message_ibfk_1` (`user_id`) REFERENCES `user` (`id`) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE `pending_password_reset` ADD CONSTRAINT FOREIGN KEY `pending_password_reset_ibfk_1` (`user_id`) REFERENCES `user` (`id`) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE `pending_phone_change` DROP FOREIGN KEY `pending_phone_change_ibfk_1`;
ALTER TABLE `pending_phone_change` ADD CONSTRAINT FOREIGN KEY `pending_phone_change_ibfk_1` (`user_id`) REFERENCES `user` (`id`) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE `url_alias_visit` DROP FOREIGN KEY `url_alias_visit_ibfk_1`;
ALTER TABLE `url_alias_visit` ADD CONSTRAINT FOREIGN KEY `url_alias_visit_ibfk_1` (`url_alias_id`) REFERENCES `url_alias` (`id`) ON UPDATE CASCADE ON DELETE CASCADE;

-- 0.7.4

DROP TRIGGER IF EXISTS user_insert_lower;
DELIMITER //
CREATE TRIGGER user_before_insert BEFORE INSERT ON `user`
FOR EACH ROW BEGIN
	SET NEW.handle = LOWER(NEW.handle);
	SET NEW.email = LOWER(NEW.email);
	SELECT id INTO @c FROM pending_email_change WHERE `email`=NEW.email;
	IF (@c > 0) THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'This email address is not unique!';
	END IF;
END //
DELIMITER ;

DROP TRIGGER IF EXISTS user_update_lower;
DELIMITER //
CREATE TRIGGER user_before_update BEFORE UPDATE ON `user`
FOR EACH ROW BEGIN
	SET NEW.handle = LOWER(NEW.handle);
	SET NEW.email = LOWER(NEW.email);
	SELECT COUNT(*) INTO @c FROM `pending_email_change` WHERE `email`=NEW.email;
	if (@c > 0) THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'This email address is not unique!';
	END IF;
END //
DELIMITER ;

DROP TRIGGER IF EXISTS `pending_email_before_insert`;
DELIMITER //
CREATE TRIGGER pending_email_before_insert BEFORE INSERT ON `pending_email_change`
FOR EACH ROW BEGIN
	SELECT COUNT(*) INTO @c FROM `user` WHERE `email`=NEW.email;
	if (@c > 0) THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'This email address is not unique!';
	END IF;
END //
DELIMITER ;

DROP TRIGGER IF EXISTS `pending_email_before_update`;
DELIMITER //
CREATE TRIGGER pending_email_before_update BEFORE UPDATE ON `pending_email_change`
FOR EACH ROW BEGIN
	SELECT COUNT(*) INTO @c FROM `user` WHERE `email`=NEW.email;
	if (@c > 0) THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'This email address is not unique!';
	END IF;
END //
DELIMITER ;

-- 0.7.5

ALTER TABLE `active` DROP FOREIGN KEY `active_ibfk_1`;
ALTER TABLE `active` ADD CONSTRAINT FOREIGN KEY `active_ibfk_1` (`user_id`) REFERENCES
	`user` (`id`) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE `section_active_role` ADD COLUMN `open` TINYINT(1) DEFAULT 1;

DROP PROCEDURE IF EXISTS `createGroups`;
DELIMITER //
CREATE PROCEDURE `createGroups` (IN numGroups INT)
BEGIN
	DECLARE ysName varchar(100);
	WHILE numGroups > 0 DO
		SELECT `user_id`, `alias` INTO @ownerID, @ownerName FROM `active` WHERE NOT `user_id` IS NULL ORDER BY RAND() LIMIT 1;
		INSERT INTO `active` (`user_id`, `group_id`, `alias`, `enabled`, `created`) VALUES
			(NULL, NULL, CONCAT(@ownerName, "'s Group"), 1, CURRENT_TIMESTAMP);
		SET @groupActive := LAST_INSERT_ID();
		INSERT INTO `group` (`active_id`, `owner_id`, `created`, `open_to_requests`) VALUES (
			@groupActive, @ownerID, CURRENT_TIMESTAMP, randNumber(0,1)
		);
		SET @groupID := LAST_INSERT_ID();
		UPDATE `active` SET `group_id`=@groupID WHERE `id`=@groupActive;
		CALL groupAddMembers(@groupID, randNumber(2,10));
		SET numGroups = numGroups - 1;
	END WHILE;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS `groupAddMembers`;
DELIMITER //
CREATE PROCEDURE `groupAddMembers` (IN groupID INT, IN members INT)
BEGIN
	WHILE members > 0 DO
		INSERT INTO `user_group_membership` (user_id, group_id, role_id, start_time, end_time, user_confirmed, group_confirmed) VALUES (
			(SELECT `id` FROM `user` ORDER BY RAND() LIMIT 1),
			groupID, (SELECT `id` FROM `role` ORDER BY RAND() LIMIT 1),
			CURRENT_TIMESTAMP - INTERVAL randNumber(1, 100) DAY,
			CURRENT_TIMESTAMP + INTERVAL randNumber(1, 100) DAY,
			1, 1);
		SET members = members - 1;
	END WHILE;
END //
DELIMITER ;

DROP TRIGGER IF EXISTS `user_before_delete`;
DELIMITER //
CREATE TRIGGER user_before_delete BEFORE DELETE ON `user`
FOR EACH ROW BEGIN
	UPDATE `section_active_role` SET `open`=0 WHERE `active_id` IN (
		SELECT `id` FROM `active` WHERE `user_id`=OLD.id
	);
END //
DELIMITER ;

DROP TRIGGER IF EXISTS `sar_before_update`;
DELIMITER //
CREATE TRIGGER sar_before_update BEFORE UPDATE ON `section_active_role`
FOR EACH ROW BEGIN
	SET NEW.`open`=1;
END //
DELIMITER ;

-- 0.7.6

DROP PROCEDURE IF EXISTS `randUserRSVPs`;
DELIMITER //
CREATE PROCEDURE `randUserRSVPs` (IN userID INT, IN numRSVPs INT)
BEGIN
	WHILE numRSVPs > 0 DO
		INSERT INTO `yoller_occurrence_rsvp` (yoller_occurrence_id, user_id) VALUES (
			(SELECT `id` FROM `yoller_occurrence` ORDER BY RAND() LIMIT 1),
			userID
		);
		SET numRSVPs = numRSVPs - 1;
	END WHILE;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS `randRSVPs`;
DELIMITER //
CREATE PROCEDURE `randRSVPs` (IN numRSVPs INT)
BEGIN
	WHILE numRSVPs > 0 DO
		INSERT INTO `yoller_occurrence_rsvp` (yoller_occurrence_id, user_id) VALUES (
			(SELECT `id` FROM `yoller_occurrence` ORDER BY RAND() LIMIT 1),
			(SELECT `id` FROM `user` ORDER BY RAND() LIMIT 1)
		);
		SET numRSVPs = numRSVPs - 1;
	END WHILE;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS `randYollerRSVPs`;
DELIMITER //
CREATE PROCEDURE `randYollerRSVPs` (IN yollerID INT, IN numRSVPs INT)
BEGIN
	WHILE numRSVPs > 0 DO
		INSERT INTO `yoller_occurrence_rsvp` (yoller_occurrence_id, user_id) VALUES (
			(SELECT `id` FROM `yoller_occurrence` WHERE `yoller_id`=yollerID ORDER BY RAND() LIMIT 1),
			(SELECT `id` FROM `user` ORDER BY RAND() LIMIT 1)
		);
		SET numRSVPs = numRSVPs - 1;
	END WHILE;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS `randOccurrenceRSVPs`;
DELIMITER //
CREATE PROCEDURE `randOccurrenceRSVPs` (IN yollerOccID INT, IN numRSVPs INT)
BEGIN
	WHILE numRSVPs > 0 DO
		INSERT INTO `yoller_occurrence_rsvp` (yoller_occurrence_id, user_id) VALUES (
			yollerOccID,
			(SELECT `id` FROM `user` ORDER BY RAND() LIMIT 1)
		);
		SET numRSVPs = numRSVPs - 1;
	END WHILE;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS `randUserFollowees`;
DELIMITER //
CREATE PROCEDURE `randUserFollowees` (IN followeeID INT, IN numFollowers INT)
BEGIN
	WHILE numFollowers > 0 DO
		INSERT INTO `active_follower` (`active_id`, `follower_id`, `notifications`) VALUES (
			(SELECT `active_id` FROM `user` WHERE `id`=followeeID),
			(SELECT `id` FROM `user` ORDER BY RAND() LIMIT 1),
			0
		);
		SET numFollowers = numFollowers - 1;
	END WHILE;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS `randUserFollows`;
DELIMITER //
CREATE PROCEDURE `randUserFollows` (IN followerID INT, IN numFollowees INT)
BEGIN
	WHILE numFollowees > 0 DO
		INSERT INTO `active_follower` (`active_id`, `follower_id`, `notifications`) VALUES (
			(SELECT `id` FROM `active` WHERE `user_id` IS NOT NULL OR `group_id` IS NOT NULL ORDER BY RAND() LIMIT 1),
			followeeID,
			0
		);
		SET numFollowees = numFollowees - 1;
	END WHILE;
END //
DELIMITER ;

-- 0.7.6.1

ALTER TABLE `pending_email_change` ADD UNIQUE INDEX (`email`);

-- 0.7.7

ALTER TABLE `role` ADD COLUMN `popularity` int(10) UNSIGNED NOT NULL DEFAULT 3;

UPDATE `role` SET `popularity` =10 WHERE `custom`=0 AND `label` IN (
	'Director','Headliner','Host'
);

UPDATE `role` SET `popularity` = 8 WHERE `custom`=0 AND `label` IN (
	'Opener','Musician','Drummer','Guitarist','Bassist','Pianist','Horn Blower',
	'Saxophonist','Trumpeter','Flutist','Clarinetist','Vocalist','Singer','Soprano',
	'Mezzo-soprano','Contralto','Countertenor','Tenor','Baritone','Bass','Treble',
	'Actor','Artist','Painter','Illustrator','Pencils','Comedian'
);
UPDATE `role` SET `popularity` = 8, `label`='Ukulele', `parent_role_id`=15 WHERE `custom`=0 AND `label`='Ukelele';

UPDATE `role` SET `popularity` = 7 WHERE `custom`=0 AND `label` IN (
	'Writer','Playwright','Producer','Choreographer'
);

UPDATE `role` SET `popularity` = 6 WHERE `custom`=0 AND `label` IN (
	'Stage Manager','Production Manager','Designer','Scenic Designer',
	'Sound Designer','Costume Designer','Lighting Designer','Photographer',
	'Adaptation','Inks'
);

UPDATE `role` SET `popularity` = 5 WHERE `custom`=0 AND `label` IN (
	'Assistant Director','Dance Captain'
);

UPDATE `role` SET `popularity` = 4 WHERE `custom`=0 AND `label` IN (
	'Manager','Assistant Stage Manager','Dancer','Videographer'
);

UPDATE `role` SET `popularity` = 3 WHERE `custom`=0 AND `label`='Video Editor';

UPDATE `role` SET `popularity` = 2 WHERE `custom`=0 AND `label` IN (
	'Assistant Production Manager','Camera Work','Post-Production'
);

-- 0.7.8

ALTER TABLE `yoller_occurrence_rsvp` DROP FOREIGN KEY `yoller_occurrence_rsvp_ibfk_2`;
ALTER TABLE `yoller_occurrence_rsvp` CHANGE COLUMN `user_id` `user_id` int(10) UNSIGNED;
ALTER TABLE `yoller_occurrence_rsvp` ADD CONSTRAINT FOREIGN KEY (`user_id`) REFERENCES `user` (`id`);
ALTER TABLE `yoller_occurrence`      ADD COLUMN `popularity` int(10) UNSIGNED NOT NULL DEFAULT 0;
ALTER TABLE `yoller` ADD    COLUMN `popularity`    int(10) UNSIGNED NOT NULL DEFAULT    0;
ALTER TABLE `active` ADD    COLUMN `popularity`    int(10) UNSIGNED NOT NULL DEFAULT    0;
ALTER TABLE `user`   CHANGE COLUMN `phone` `phone` char(12)                  DEFAULT NULL;
ALTER TABLE `user`   ADD    COLUMN `profile_views` int(10) UNSIGNED NOT NULL DEFAULT    0;

CREATE TABLE `venue` (
	`id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`popularity` int(10) UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

ALTER TABLE `yoller_occurrence` ADD COLUMN `venue_id` int(10) UNSIGNED DEFAULT NULL;
ALTER TABLE `yoller_occurrence` ADD CONSTRAINT FOREIGN KEY (`venue_id`) REFERENCES `venue` (`id`);

CREATE TABLE `uu_score` (
	`id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`user_1` int(10) UNSIGNED NOT NULL,
	`user_2` int(10) UNSIGNED NOT NULL,
	-- following: just as easy to look up
	`similar_role` int(10) UNSIGNED NOT NULL DEFAULT 0,
	-- if users shared similar roles
	-- increases with each new role, but weighted logarithmically
	`rsvp_same_yoller_occ` int(10) UNSIGNED NOT NULL DEFAULT 0,
	-- if the users attended same yoller occurrence with non-null rsvp
	-- accounted for after-the-fact
	-- (fewer rsvps) > (more rsvps)
	`in_same_group` int(10) UNSIGNED NOT NULL DEFAULT 0,
	-- if the users shared group memberships
	-- (at the same time) > (at different times)
	-- accounted for at membership join
	-- (fewer members) > (more members)
	`collabs_in_yoller` int(10) UNSIGNED NOT NULL DEFAULT 0,
	-- if the users were collabs in the same yoller
	-- (same section) > (different sections)
	-- fewer people in yoller > greater people in yoller
	`invite` int(10) UNSIGNED NOT NULL DEFAULT 0,
	-- if one user invited the other to Ilion.
	`add_to_yoller` int(10) UNSIGNED NOT NULL DEFAULT 0,
	-- if one user added the other to a yoller.
	`rsvp` int(10) UNSIGNED NOT NULL DEFAULT 0,
	-- if one user rsvps to a yoller that another user is part of.
	`composite` int(10) UNSIGNED NOT NULL DEFAULT 0,
	`updated` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	INDEX `uu_score_user_index` (`user_1`, `user_2`),
	CONSTRAINT FOREIGN KEY (`user_1`) REFERENCES `user` (`id`),
	CONSTRAINT FOREIGN KEY (`user_2`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Keep track of the last yoller ID to be added to the queue.
-- That way, it doesn't need to happen on yoller creation.
-- Rather, when the process is run, it scans for newly created
-- yollers and adds them to the bg_yoller_create queue.
INSERT INTO `db_info` (`key`, `value`) VALUES ('bg_yoller_id', 0);

-- Now, this queue table will hold all the yollers whose last occurrence
-- is in the future. Once a yoller is processed (not necessarily in
-- order of ID ASC) it is removed from the table.
CREATE TABLE `bg_yoller_create` (
	`id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`yoller_id` int(10) UNSIGNED NOT NULL,
	CONSTRAINT FOREIGN KEY (`yoller_id`) REFERENCES `yoller` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Also keep track of last processed user_group_membership id
-- for in_same_group.
INSERT INTO `db_info` (`key`, `value`) VALUES ('bg_ugm_id', 0);

CREATE TABLE `ug_score` (
	`id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`user_id` int(10) UNSIGNED NOT NULL,
	`group_id` int(10) UNSIGNED NOT NULL,
	-- following: just as easy to look up
	-- membership: just as easy to look up
	`rsvp` int(10) UNSIGNED NOT NULL DEFAULT 0,
	-- if user non-null rsvp-ed to a yoller with the group in it
	`collab` int(10) UNSIGNED NOT NULL DEFAULT 0,
	-- if user collaborated in the same yoller as the group
	-- (same section) > (different section)
	`max_user` int(10) UNSIGNED NOT NULL DEFAULT 0,
	-- maximum of u <-> u for all u in group
	`composite` int(10) UNSIGNED NOT NULL DEFAULT 0,
	`updated` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
	CONSTRAINT FOREIGN KEY (`group_id`) REFERENCES `group` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 0.7.8.1

ALTER TABLE `uu_score` DROP COLUMN `similar_role`;
ALTER TABLE `user_message` ADD COLUMN `type` enum('rsvp_rating') NOT NULL DEFAULT 'rsvp_rating';
ALTER TABLE `user_message` ADD COLUMN `yoller_id` 	int(10) UNSIGNED DEFAULT NULL;
ALTER TABLE `user_message` ADD COLUMN `occ_id` 		int(10) UNSIGNED DEFAULT NULL;
ALTER TABLE `user_message` ADD COLUMN `group_id` 	int(10) UNSIGNED DEFAULT NULL;
ALTER TABLE `user_message` ADD COLUMN `active_id` 	int(10) UNSIGNED DEFAULT NULL;
ALTER TABLE `user_message` ADD COLUMN `sar_id` 		int(10) UNSIGNED DEFAULT NULL;
ALTER TABLE `user_message` ADD CONSTRAINT FOREIGN KEY (`yoller_id`) REFERENCES `yoller` (`id`)				ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE `user_message` ADD CONSTRAINT FOREIGN KEY (`occ_id`) 	REFERENCES `yoller_occurrence` (`id`)	ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE `user_message` ADD CONSTRAINT FOREIGN KEY (`group_id`) 	REFERENCES `group` (`id`)				ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE `user_message` ADD CONSTRAINT FOREIGN KEY (`active_id`) REFERENCES `active` (`id`)				ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE `user_message` ADD CONSTRAINT FOREIGN KEY (`sar_id`) 	REFERENCES `section_active_role` (`id`)	ON UPDATE CASCADE ON DELETE CASCADE;

-- 0.7.8.2

CREATE TABLE `bg_invite` (
	`id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`inviter` int(10) UNSIGNED NOT NULL,
	`invited` int(10) UNSIGNED NOT NULL,
	CONSTRAINT FOREIGN KEY (`inviter`) REFERENCES `user` (`id`),
	CONSTRAINT FOREIGN KEY (`invited`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 0.7.9

DROP TRIGGER IF EXISTS user_before_update;
DELIMITER //
CREATE TRIGGER user_before_update BEFORE UPDATE ON `user`
FOR EACH ROW BEGIN
	SELECT COUNT(*) INTO @c FROM `pending_email_change` WHERE `email`=NEW.email;
	if (@c > 0) THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'This email address is not unique!';
	END IF;
END //
DELIMITER ;

ALTER TABLE `bg_invite` DROP FOREIGN KEY `bg_invite_ibfk_1`;
ALTER TABLE `bg_invite` DROP FOREIGN KEY `bg_invite_ibfk_2`;
ALTER TABLE `bg_invite` ADD CONSTRAINT FOREIGN KEY (`inviter`) REFERENCES `user` (`id`);
ALTER TABLE `bg_invite` ADD CONSTRAINT FOREIGN KEY (`invited`) REFERENCES `user` (`id`);

DROP TRIGGER IF EXISTS uu_score_before_update;
DELIMITER //
CREATE TRIGGER uu_score_before_update BEFORE UPDATE ON `uu_score`
FOR EACH ROW BEGIN
	-- see if there is u<->u following. @follow := (0: none, 1: one-directional, 2: bi-directional)
	SELECT COUNT(1) INTO @follow FROM `active_follower` WHERE
		(`follower_id`=OLD.user_1 AND `active_id` IN (SELECT `id` FROM `active` WHERE `user_id`=OLD.user_2)) OR
		(`follower_id`=OLD.user_2 AND `active_id` IN (SELECT `id` FROM `active` WHERE `user_id`=OLD.user_1));
	SET NEW.composite =
		@follow +
		NEW.rsvp_same_yoller_occ + 	NEW.in_same_group +
		NEW.collabs_in_yoller + 	NEW.invite +
		NEW.add_to_yoller + 		NEW.rsvp;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS `randUserFollows`;
DELIMITER //
CREATE PROCEDURE `randUserFollows` (IN followerID INT, IN numFollowees INT)
BEGIN
	WHILE numFollowees > 0 DO
		INSERT INTO `active_follower` (`active_id`, `follower_id`, `notifications`) VALUES (
			(SELECT `id` FROM `active` WHERE `user_id` IS NOT NULL OR `group_id` IS NOT NULL ORDER BY RAND() LIMIT 1),
			followerID,
			0
		);
		SET numFollowees = numFollowees - 1;
	END WHILE;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS `randUserFollowees`;
DROP PROCEDURE IF EXISTS `randUserFollowers`;
DELIMITER //
CREATE PROCEDURE `randUserFollowers` (IN followeeID INT, IN numFollowers INT)
BEGIN
	WHILE numFollowers > 0 DO
		INSERT INTO `active_follower` (`active_id`, `follower_id`, `notifications`) VALUES (
			(SELECT `active_id` FROM `user` WHERE `id`=followeeID),
			(SELECT `id` FROM `user` ORDER BY RAND() LIMIT 1),
			0
		);
		SET numFollowers = numFollowers - 1;
	END WHILE;
END //
DELIMITER ;

DROP TRIGGER IF EXISTS `sar_before_update`;
DELIMITER //
CREATE TRIGGER sar_before_update BEFORE UPDATE ON `section_active_role`
FOR EACH ROW BEGIN
	-- if not explicitly closing
	IF (OLD.`open`=0 AND NEW.`open`=0) THEN
		SET NEW.`open`=1;
	END IF;
END //
DELIMITER ;

-- 0.7.9.1

ALTER TABLE `yoller_occurrence` DROP FOREIGN KEY `yoller_occurrence_ibfk_2`;
ALTER TABLE `yoller_occurrence` DROP COLUMN `venue_id`;
ALTER TABLE `venue` ADD COLUMN `place_id` VARCHAR(70) NOT NULL;
ALTER TABLE `venue` ADD UNIQUE INDEX (`place_id`);
ALTER TABLE `yoller_occurrence` ADD COLUMN `place_id` VARCHAR(70) DEFAULT NULL;
ALTER TABLE `yoller_occurrence` ADD CONSTRAINT FOREIGN KEY (`place_id`) REFERENCES `venue` (`place_id`);

DROP TRIGGER IF EXISTS `y_occ_before_insert`;
DELIMITER //
CREATE TRIGGER y_occ_before_insert BEFORE INSERT ON `yoller_occurrence`
FOR EACH ROW BEGIN
	SELECT COUNT(1) INTO @numRows FROM `venue` WHERE `place_id`=NEW.place_id;
	IF (@numRows < 1) THEN
		INSERT INTO `venue` (`popularity`, `place_id`) VALUES (0, NEW.place_id);
	END IF;
END //
DELIMITER ;

DROP TRIGGER IF EXISTS `y_occ_before_update`;
DELIMITER //
CREATE TRIGGER y_occ_before_update BEFORE UPDATE ON `yoller_occurrence`
FOR EACH ROW BEGIN
	SELECT COUNT(1) INTO @numRows FROM `venue` WHERE `place_id`=NEW.place_id;
	IF (@numRows < 1) THEN
		INSERT INTO `venue` (`popularity`, `place_id`) VALUES (0, NEW.place_id);
	END IF;
END //
DELIMITER ;

-- 0.7.9.2

ALTER TABLE `user` ADD COLUMN `given_name` varchar(30) DEFAULT NULL;
ALTER TABLE `user` ADD COLUMN `family_name` varchar(30) DEFAULT NULL;

-- 0.7.9.3

DROP TRIGGER IF EXISTS `y_occ_before_insert`;
DELIMITER //
CREATE TRIGGER y_occ_before_insert BEFORE INSERT ON `yoller_occurrence`
FOR EACH ROW BEGIN
	IF NOT (NEW.place_id  IS NULL) THEN
		SELECT COUNT(1) INTO @numRows FROM `venue` WHERE `place_id`=NEW.place_id;
		IF (@numRows < 1) THEN
			INSERT INTO `venue` (`popularity`, `place_id`) VALUES (0, NEW.place_id);
		END IF;
	END IF;
END //
DELIMITER ;

DROP TRIGGER IF EXISTS `y_occ_before_update`;
DELIMITER //
CREATE TRIGGER y_occ_before_update BEFORE UPDATE ON `yoller_occurrence`
FOR EACH ROW BEGIN
	IF NOT (NEW.place_id IS NULL) THEN
		SELECT COUNT(1) INTO @numRows FROM `venue` WHERE `place_id`=NEW.place_id;
		IF (@numRows < 1) THEN
			INSERT INTO `venue` (`popularity`, `place_id`) VALUES (0, NEW.place_id);
		END IF;
	END IF;
END //
DELIMITER ;

-- 0.7.9.4

ALTER TABLE `yoller_occurrence` CHANGE `latitude` `latitude` varchar(50) DEFAULT NULL;
ALTER TABLE `yoller_occurrence` CHANGE `longitude` `longitude` varchar(50) DEFAULT NULL;

-- 0.7.9.5

INSERT INTO `role` (`label`, `parent_role_id`, `custom`, `repeat`, `popularity`) VALUES ('Acknowledgment', NULL, 0, 0, 1);
SET @acknowledgmentID := LAST_INSERT_ID();
INSERT INTO `role` (`label`, `parent_role_id`, `custom`, `repeat`, `popularity`) VALUES ('Dedicated to', @acknowledgmentID, 0, 0, 1);
INSERT INTO `role` (`label`, `parent_role_id`, `custom`, `repeat`, `popularity`) VALUES ('In Memory of', @acknowldgmentID, 0, 0, 1);
INSERT INTO `role` (`label`, `parent_role_id`, `custom`, `repeat`, `popularity`) VALUES ('Special Thanks', @acknowledgmentID, 0, 0, 1);
INSERT INTO `role` (`label`, `parent_role_id`, `custom`, `repeat`, `popularity`) VALUES ('Ensemble', 1, 0, 0, 6);

DROP TABLE IF EXISTS `flag`;
CREATE TABLE `flag` (
	`id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`label` varchar(50) NOT NULL,
	`description` varchar(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO `flag` (`label`, `description`) VALUES ('Violence', 'This event includes depictions of gore, bloodshed, fighting, or other violent images.');
INSERT INTO `flag` (`label`, `description`) VALUES ('Weapons', 'This event involves the simulated use of or display of swords, guns, or other weapons.');
INSERT INTO `flag` (`label`, `description`) VALUES ('Nudity', 'Partial or full exposure of the body may occur during this event.');
INSERT INTO `flag` (`label`, `description`) VALUES ('Strong Language', 'This event may contain profanity or discussion of adult topics.');
INSERT INTO `flag` (`label`, `description`) VALUES ('Sexual Content', 'This event may depict or imply sexual content which may be inappropriate for children.');
INSERT INTO `flag` (`label`, `description`) VALUES ('Strobe', 'If you suffer from epilepsy or otherwise might be triggered by bright flashing lights, be advised that a strobe light will be used during this event.');
INSERT INTO `flag` (`label`, `description`) VALUES ('Haze/Fog', 'Stage fog, smoke, or theatrical haze will be used during this event.');
INSERT INTO `flag` (`label`, `description`) VALUES ('Mobility', 'This event requires participants to move quickly from place to place. If you are mobility-impaired, you may not get a full experience of the event.');
INSERT INTO `flag` (`label`, `description`) VALUES ('Family Friendly', 'This event is appropriate for children as well as adults of all ages.');

DROP TABLE IF EXISTS `yoller_flag`;
CREATE TABLE `yoller_flag` (
	`id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`yoller_id` int(10) UNSIGNED NOT NULL,
	`flag_id` int(10) UNSIGNED NOT NULL,
	CONSTRAINT FOREIGN KEY (`flag_id`) REFERENCES `flag` (`id`),
	CONSTRAINT FOREIGN KEY (`yoller_id`) REFERENCES `yoller` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 0.7.9.6

ALTER TABLE `flag` ADD COLUMN `short` varchar(4) NOT NULL DEFAULT 'aaa';
UPDATE `flag` SET `label`='Adult Content' WHERE `label`='Sexual Content';
UPDATE `flag` SET `short`='vlnc' WHERE `label`='Violence';
UPDATE `flag` SET `short`='wpns' WHERE `label`='Weapons';
UPDATE `flag` SET `short`='nude' WHERE `label`='Nudity';
UPDATE `flag` SET `short`='slng' WHERE `label`='Strong Language';
UPDATE `flag` SET `short`='adlt' WHERE `label`='Adult Content';
UPDATE `flag` SET `short`='strb' WHERE `label`='Strobe';
UPDATE `flag` SET `short`='fog' WHERE `label`='Haze/Fog';
UPDATE `flag` SET `short`='mobl' WHERE `label`='Mobility';
UPDATE `flag` SET `short`='fam' WHERE `label`='Family Friendly';

-- 0.7.9.7

ALTER TABLE `yoller` ADD COLUMN `flags` smallint unsigned DEFAULT 0;

-- 0.7.9.8

INSERT INTO `yoller_type` (`label`, `plural`, `short`) VALUES ('Performance Art', 'Performance Art', 'prfa');
INSERT INTO `yoller_type` (`label`, `plural`, `short`) VALUES ('Dance', 'Dance', 'danc');
INSERT INTO `yoller_type` (`label`, `plural`, `short`) VALUES ('Musical', 'Musicals', 'mscl');
INSERT INTO `yoller_type` (`label`, `plural`, `short`) VALUES ('Cabaret', 'Cabarets', 'cbrt');
INSERT INTO `yoller_type` (`label`, `plural`, `short`) VALUES ('Film Screening', 'Film Screenings', 'flms');
INSERT INTO `yoller_type` (`label`, `plural`, `short`) VALUES ('Sketch Comedy', 'Sketch Comedy', 'skch');
INSERT INTO `yoller_type` (`label`, `plural`, `short`) VALUES ('Multi-Media', 'Multi-Media', 'mlti');
INSERT INTO `yoller_type` (`label`, `plural`, `short`) VALUES ('Installation', 'Installations', 'inst');

-- 0.8

INSERT INTO `role` (`label`, `parent_role_id`, `custom`, `repeat`, `popularity`) VALUES
	('Sound Editor', @postID, 0, 0, 3), ('Technical Director', NULL, 0, 0, 4), ('Presented by', NULL, 0, 0, 1),
	('Dramaturg', NULL, 0, 0, 5), ('Media Designer', @designerID, 0, 0, 6), ('Crew', NULL, 0, 0, 2), ('Rigger', NULL, 0, 0, 3),
	('Performer', NULL, 0, 0, 8), ('Music Director', NULL, 0, 0, 6), ('Accompanist', @musicianID, 0, 0, 6),
	('Creator', NULL, 0, 0, 8);
SELECT `id` INTO @writerID FROM `role` WHERE `label`='Writer' AND `custom`=0 AND `parent_role_id` IS NULL;
INSERT INTO `role` (`label`, `parent_role_id`, `custom`, `repeat`, `popularity`) VALUES ('Screenwriter', @writerID, 0, 0, 3);

-- 0.8.1
ALTER TABLE `yoller` ADD COLUMN `locked` tinyint(1) NOT NULL DEFAULT 0;

-- 0.8.2
ALTER TABLE `yoller_occurrence` CHANGE `friendly_location` `friendly_location` varchar(255) NOT NULL DEFAULT '';

-- 0.8.3
ALTER TABLE `user` ADD COLUMN `sticky` tinyint(1) NOT NULL DEFAULT 1;

DROP TABLE IF EXISTS `user_feedback`;
CREATE TABLE `user_feedback` (
	`id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`user_id` int(10) UNSIGNED NOT NULL,
	`good` TEXT,
	`bad` TEXT,
	`featureRequest` TEXT,
	CONSTRAINT FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 0.8.4
ALTER TABLE `yoller_occurrence` ADD COLUMN `local_time` varchar(24) NOT NULL;

-- 0.8.5
DROP TABLE IF EXISTS `feature_req`;
CREATE TABLE `feature_req` (
	`id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`name` varchar(50) NOT NULL,
	`description` TEXT,
	`code` varchar(4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `user_feature_req`;
CREATE TABLE `user_feature_req` (
	`id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`user_id` int(10) UNSIGNED NOT NULL,
	`feature_req_id` int(10) UNSIGNED NOT NULL,
	`value` smallint(2) NOT NULL,
	`timestamp` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)ON UPDATE CASCADE ON DELETE CASCADE,
	CONSTRAINT FOREIGN KEY (`feature_req_id`) REFERENCES `feature_req` (`id`) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 0.8.6
ALTER TABLE `feature_req` ADD COLUMN `in_progress` tinyint(1) NOT NULL DEFAULT 0;

-- 0.8.7
ALTER TABLE `yoller_occurrence` MODIFY `local_time` varchar(19) NOT NULL;

-- 0.8.8
ALTER TABLE `user` ADD COLUMN `admin` tinyint(1) NOT NULL DEFAULT 0;
ALTER TABLE `venue` ADD COLUMN `name` varchar(50) NOT NULL;
ALTER TABLE `venue` ADD COLUMN `description` TEXT;
ALTER TABLE `venue` ADD COLUMN `link` varchar(100);
ALTER TABLE `venue` ADD COLUMN `phone` varchar(12);
ALTER TABLE `venue` ADD COLUMN `email` varchar(100);
ALTER TABLE `venue` ADD COLUMN `latitude` int unsigned;
ALTER TABLE `venue` ADD COLUMN `longitude` int unsigned;
ALTER TABLE `venue` ADD COLUMN `profile_photo_id` int unsigned;
ALTER TABLE `venue` ADD COLUMN `cover_photo_id` int unsigned;
ALTER TABLE `venue` ADD CONSTRAINT FOREIGN KEY (`profile_photo_id`) REFERENCES `photo` (`id`) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE `venue` ADD CONSTRAINT FOREIGN KEY (`cover_photo_id`) REFERENCES `photo` (`id`) ON UPDATE CASCADE ON DELETE SET NULL;

-- 0.8.9
ALTER TABLE `yoller_occurrence` MODIFY `timestamp` DATETIME NOT NULL;

-- 0.9.0
DROP TABLE IF EXISTS `pending_occurrence_update`;
CREATE TABLE `pending_occurrence_update` (
   `yoller_occurrence_id` int(10) UNSIGNED NOT NULL PRIMARY KEY,
   `local_time_prev` varchar(19),
   `local_time` varchar(19) NOT NULL,
   `latitude` DECIMAL(8,5),
   `longitude` DECIMAL(8,5),
   CONSTRAINT FOREIGN KEY (`yoller_occurrence_id`) REFERENCES `yoller_occurrence` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 0.9.1
ALTER TABLE `venue` MODIFY `latitude` DECIMAL(8,5);
ALTER TABLE `venue` MODIFY `longitude` DECIMAL(8,5);      

DROP TRIGGER IF EXISTS `y_occ_before_insert`;
DELIMITER //
CREATE TRIGGER y_occ_before_insert BEFORE INSERT ON `yoller_occurrence`
FOR EACH ROW BEGIN
  IF (NEW.place_id IS NOT NULL) THEN
    SELECT COUNT(1) INTO @numRows FROM `venue` WHERE `place_id`=NEW.place_id;
    IF (@numRows < 1) THEN
      INSERT INTO `venue` (`popularity`, `place_id`, `name`, `latitude`, `longitude`)
        VALUES (0, NEW.place_id, NEW.friendly_location, NEW.latitude, NEW.longitude);
    END IF;
  END IF;
END //
DELIMITER ;

DROP TRIGGER IF EXISTS `y_occ_before_update`;
DELIMITER //
CREATE TRIGGER y_occ_before_update BEFORE UPDATE ON `yoller_occurrence` 
FOR EACH ROW BEGIN
  IF (NEW.place_id IS NOT NULL) THEN
    SELECT COUNT(1) INTO @numRows FROM `venue` WHERE `place_id`=NEW.place_id;
    IF (@numRows < 1) THEN
      INSERT INTO `venue` (`popularity`, `place_id`, `name`, `latitude`, `longitude`)
        VALUES (0, NEW.place_id, NEW.friendly_location, NEW.latitude, NEW.longitude);
    END IF;
  END IF;
END //
DELIMITER ;

-- 0.9.2
ALTER TABLE `yoller_occurrence_rsvp` ADD COLUMN `confirmed` tinyint(1) NOT NULL DEFAULT 0;

-- 0.9.3
ALTER TABLE `yoller` ADD COLUMN `rule` varchar(274);
ALTER TABLE `yoller` ADD COLUMN `rule_start_date` varchar(10);
ALTER TABLE `yoller` ADD COLUMN `rule_end_date` varchar(10);
ALTER TABLE `yoller` ADD COLUMN `rule_venue_id` int(10);
ALTER TABLE `yoller_occurrence` ADD COLUMN `from_rule` tinyint(1) NOT NULL DEFAULT 0;

-- 0.9.4

DROP TABLE IF EXISTS `auth_tokens`;

CREATE TABLE auth_tokens (
    `id` int UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `series_id` char(16) NOT NULL,
    `validator` char(64) NOT NULL,
    `user_id` int UNSIGNED NOT NULL,
    `expires` DATETIME,
	 UNIQUE INDEX (`series_id`),
	 CONSTRAINT FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 0.9.5
DROP TABLE IF EXISTS `pending_occurrence_update`;
DROP TRIGGER IF EXISTS `y_occ_before_insert`;
DROP TRIGGER IF EXISTS `y_occ_before_update`;

ALTER TABLE `venue` MODIFY `name` varchar(60);
ALTER TABLE `venue` MODIFY `place_id` varchar(70);
ALTER TABLE `venue` ADD COLUMN `address` varchar(200);
ALTER TABLE `venue` ADD COLUMN `timezone` varchar(44);

ALTER TABLE `yoller_occurrence` DROP FOREIGN KEY `yoller_occurrence_ibfk_2`;
ALTER TABLE `yoller_occurrence` ADD COLUMN `venue_id` int(10) UNSIGNED DEFAULT NULL;
ALTER TABLE `yoller_occurrence` DROP COLUMN `timestamp`;
ALTER TABLE `yoller_occurrence` DROP COLUMN `latitude`;
ALTER TABLE `yoller_occurrence` DROP COLUMN `longitude`;
ALTER TABLE `yoller_occurrence` DROP COLUMN `friendly_location`;
ALTER TABLE `yoller_occurrence` DROP COLUMN `place_id`;
ALTER TABLE `yoller_occurrence` DROP COLUMN `popularity`;
ALTER TABLE `yoller_occurrence` ADD CONSTRAINT FOREIGN KEY (`venue_id`) REFERENCES `venue`(`id`);
ALTER TABLE `yoller_occurrence` DROP FOREIGN KEY `yoller_occurrence_ibfk_1`;

DROP TRIGGER IF EXISTS yoller_after_delete;
DELIMITER //
CREATE TRIGGER yoller_after_delete AFTER DELETE ON `yoller`
FOR EACH ROW BEGIN
   DELETE FROM `yoller_occurrence` WHERE `yoller_id` = OLD.id;
END //
DELIMITER ;
          
UPDATE `flag` SET `short`='guns', `label`='Gun Shots', `description`='This event includes live or simulated gun shots.' WHERE `label`='Weapons';

-- 0.9.6

ALTER TABLE `user` ADD COLUMN `aesir` tinyint(1) NOT NULL DEFAULT 0;

DROP PROCEDURE IF EXISTS `createUser`;
DELIMITER //
CREATE PROCEDURE `createUser` (IN displayName VARCHAR(50), IN uHandle varchar(20), IN uEmail varchar(100), IN uPassword varchar(50), IN isAdmin TINYINT(1), IN isAesir TINYINT(1))
BEGIN
	DECLARE userID, activeID INT;
	DECLARE uSalt char(10);
	SET uSalt = randWord(10);
	INSERT INTO `user` (active_id, profile_photo_id, created, handle, email, email_notifications, registered, portfolio_html, password, salt, admin, aesir) VALUES
		(NULL, NULL, CURRENT_TIMESTAMP, uHandle, uEmail, 0, 1, '', UNHEX(SHA1(CONCAT(uPassword,uSalt))), uSalt, isAdmin, isAesir);
	SET userID = LAST_INSERT_ID();
	INSERT INTO `active` (user_id, group_id, alias, enabled, created) VALUES (userID, NULL, displayName, 1, CURRENT_TIMESTAMP);
	SET activeID = LAST_INSERT_ID();
	UPDATE `user` SET `active_id`=activeID WHERE `id`=userID;
END //
DELIMITER ;

-- 0.9.7

ALTER TABLE `yoller` ADD COLUMN `verified` tinyint(1) NOT NULL DEFAULT 0;

-- 0.9.8

ALTER TABLE `user` ADD COLUMN `timezone` varchar(44) NOT NULL;

-- 0.9.9

ALTER TABLE `user` CHANGE `bio` `bio` TEXT;
ALTER TABLE `user` ADD COLUMN `tagline` varchar(150)  NOT NULL DEFAULT '';

-- 0.9.9.5

INSERT INTO `yoller_type` (`label`, `plural`, `short`) VALUES ('Festival', 'Festivals', 'fest');
INSERT INTO `yoller_type` (`label`, `plural`, `short`) VALUES ('Multi-Feature', 'Multi-Feature Events', 'mft');
INSERT INTO `yoller_type` (`label`, `plural`, `short`) VALUES ('Movement Piece', 'Movement Pieces', 'mvmt');
INSERT INTO `yoller_type` (`label`, `plural`, `short`) VALUES ('Opera', 'Operas', 'opra');

-- 1.0

DROP TABLE IF EXISTS `yoller_manager`;

CREATE TABLE yoller_manager (
   `id` int UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
   `yoller_id` int UNSIGNED NOT NULL,
   `user_id` int UNSIGNED NOT NULL,
	CONSTRAINT FOREIGN KEY (`yoller_id`) REFERENCES `yoller` (`id`) ON UPDATE CASCADE ON DELETE CASCADE,
	CONSTRAINT FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

ALTER TABLE `yoller` ADD COLUMN `passcode` varchar(50);

DROP TABLE IF EXISTS `user_yoller_hidefromresume`;

CREATE TABLE user_yoller_hidefromresume (
   `id` int UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
   `user_id` int UNSIGNED NOT NULL,
   `yoller_id` int UNSIGNED NOT NULL,
	CONSTRAINT FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON UPDATE CASCADE ON DELETE CASCADE,
	CONSTRAINT FOREIGN KEY (`yoller_id`) REFERENCES `yoller` (`id`) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

ALTER TABLE `yoller_occurrence` ADD COLUMN `exception_from_rule` tinyint(1) NOT NULL DEFAULT 0;
ALTER TABLE `yoller_occurrence` ADD COLUMN `end_time` varchar(19);

SET @performerId := (select id from role where label = 'Performer');
INSERT INTO `role` (`label`, `parent_role_id`, `custom`, `repeat`, `popularity`) VALUES ('Mover', @performerId, 0, 0, 4);
UPDATE `role` set `parent_role_id`= @performerId where `label`='Dancer';

-- 1.0.1

CREATE TABLE `pending_ghost_follow` (
	`id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`user_id` int(10) UNSIGNED NOT NULL,
	`active_id` int(10) UNSIGNED NOT NULL,
	`code` char(50) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
	FOREIGN KEY (`active_id`) REFERENCES `active` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO `db_info` (`key`, `value`) VALUES ('framework_version', '1.0.1');