
-- IlionDb
--
-- WARNING: Running this MySQL file will erase your current schema (if it exists) and all the data inside it!
-- Please only use this script to create a new, empty database. Database updates will be applied
-- automatically without running this file.

DROP SCHEMA IF EXISTS iliondb;

CREATE DATABASE iliondb;

USE iliondb;

DROP TABLE IF EXISTS db_info;


CREATE TABLE project (
  id int(10) unsigned NOT NULL AUTO_INCREMENT,
  name varchar(255) NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE character (
  id int(10) unsigned NOT NULL AUTO_INCREMENT,
  name varchar(255) NOT NULL,
  gender varchar(255) DEFAULT NULL,
  project_id int(10) unsigned NOT NULL,
  PRIMARY KEY (id),
  KEY project_id (project_id),
  CONSTRAINT character_ibfk_1 FOREIGN KEY (project_id) REFERENCES project (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE db_info (
  id int(10) unsigned NOT NULL AUTO_INCREMENT,
  key varchar(255) NOT NULL,
  value varchar(255) NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO db_info (id, key, value)
VALUES
	(1,'framework_version','0.0.5');


CREATE TABLE scene (
  id int(10) unsigned NOT NULL AUTO_INCREMENT,
  project_id int(10) unsigned NOT NULL,
  name varchar(255) DEFAULT NULL,
  start_point bigint(20) unsigned NOT NULL DEFAULT '0',
  end_point bigint(20) unsigned NOT NULL DEFAULT '600000',
  PRIMARY KEY (id),
  KEY project_id (project_id),
  CONSTRAINT scene_ibfk_1 FOREIGN KEY (project_id) REFERENCES project (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE scene_character (
  id int(10) unsigned NOT NULL AUTO_INCREMENT,
  character_id int(10) unsigned NOT NULL,
  scene_id int(10) unsigned NOT NULL,
  start_point bigint(20) unsigned DEFAULT NULL,
  end_point bigint(20) unsigned DEFAULT NULL,
  PRIMARY KEY (id),
  KEY character_id (character_id),
  KEY scene_id (scene_id),
  CONSTRAINT scene_character_ibfk_1 FOREIGN KEY (character_id) REFERENCES character (id),
  CONSTRAINT scene_character_ibfk_2 FOREIGN KEY (scene_id) REFERENCES scene (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE user (
  id int(10) unsigned NOT NULL AUTO_INCREMENT,
  profile_photo_id int(10) unsigned DEFAULT NULL,
  created timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  handle varchar(20) NOT NULL,
  name varchar(128) NOT NULL,
  email varchar(100) NOT NULL,
  registered tinyint(1) NOT NULL DEFAULT '0',
  verified tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (id),
  UNIQUE KEY handle (handle),
  UNIQUE KEY email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE user_login (
  id int(10) unsigned NOT NULL AUTO_INCREMENT,
  user_id int(10) unsigned NOT NULL,
  timestamp timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY user_id (user_id),
  CONSTRAINT user_login_ibfk_1 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

