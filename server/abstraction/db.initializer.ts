import { Sequelize } from "sequelize-typescript";

const query = `
CREATE TABLE project (
   id SERIAL PRIMARY KEY,
   name varchar(255) NOT NULL
 );
 
 CREATE TABLE character (
   id SERIAL PRIMARY KEY,
   name varchar(255) NOT NULL,
   gender varchar(255) DEFAULT NULL,
   project_id int check (project_id > 0) NOT NULL,
   CONSTRAINT character_ibfk_1 FOREIGN KEY (project_id) REFERENCES project (id)
 );
 
 CREATE INDEX character_project_id ON character (project_id);
 
 CREATE TABLE db_info (
   id SERIAL PRIMARY KEY,
   key varchar(255) NOT NULL,
   value varchar(255) NOT NULL
 );
 
 INSERT INTO db_info (id, key, value)
 VALUES
    (1,'framework_version','0.0.5');
 
 CREATE TABLE scene (
   id SERIAL PRIMARY KEY,
   project_id int check (project_id > 0) NOT NULL,
   name varchar(255) DEFAULT NULL,
   start_point bigint check (start_point > 0) NOT NULL DEFAULT '0',
   end_point bigint check (end_point > 0) NOT NULL DEFAULT '600000'
  ,
   CONSTRAINT scene_ibfk_1 FOREIGN KEY (project_id) REFERENCES project (id)
 );
 
 CREATE INDEX scene_project_id ON scene (project_id);
 
 CREATE TABLE scene_character (
   id SERIAL PRIMARY KEY,
   character_id int check (character_id > 0) NOT NULL,
   scene_id int check (scene_id > 0) NOT NULL,
   start_point bigint check (start_point > 0) DEFAULT NULL,
   end_point bigint check (end_point > 0) DEFAULT NULL
  ,
   CONSTRAINT scene_character_ibfk_1 FOREIGN KEY (character_id) REFERENCES character (id),
   CONSTRAINT scene_character_ibfk_2 FOREIGN KEY (scene_id) REFERENCES scene (id)
 );
 
 CREATE INDEX scene_character_character_id ON scene_character (character_id);
 CREATE INDEX scene_character_scene_id ON scene_character (scene_id);
 
 
 CREATE TABLE "user" (
   id SERIAL PRIMARY KEY,
   profile_photo_id int check (profile_photo_id > 0) DEFAULT NULL,
   created timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
   updated timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
   handle varchar(20) NOT NULL,
   name varchar(128) NOT NULL,
   email varchar(100) NOT NULL,
   registered smallint NOT NULL DEFAULT '0',
   verified smallint NOT NULL DEFAULT '0',
   CONSTRAINT user_handle UNIQUE  (handle),
   CONSTRAINT user_email UNIQUE  (email)
 );
 
 CREATE TABLE "user_login" (
   id SERIAL PRIMARY KEY,
   user_id int check (user_id > 0) NOT NULL,
   timestamp timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
   CONSTRAINT user_login_ibfk_1 FOREIGN KEY (user_id) REFERENCES "user" (id) ON DELETE CASCADE ON UPDATE CASCADE
 );
 
 CREATE INDEX user_login_user_id ON "user_login" (user_id);
 
 
`;

export function initializeDB(conn: Sequelize) {
   return conn.query(`select * from information_schema.tables where table_name = 'db_info'`)
   .then(function (res: any[]) {
      if (res[0].length < 1) {
         return conn.query(query);
      }
   });
}