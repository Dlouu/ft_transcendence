CREATE DATABASE IF NOT EXISTS auth_data
	CHARACTER SET utf8mb4
	COLLATE utf8mb4_unicode_ci;

use auth_data;

CREATE TABLE IF NOT EXISTS credentials (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

	username VARCHAR(255) NOT NULL,
	email VARCHAR(255) NOT NULL,
	password VARCHAR(255) NOT NULL,

	UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS refresh_token (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

	user_id BIGINT UNSIGNED NOT NULL,
	last_token VARCHAR(255) NULL UNIQUE,
	active_token VARCHAR(255) NULL UNIQUE,
	expire_date TIMESTAMP NULL,


	UNIQUE KEY uq_active_token (active_token)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS refresh_token_rules (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

	token_id BIGINT UNSIGNED NOT NULL UNIQUE,
	last_token_rules VARCHAR(255) NULL,
	active_token_rules VARCHAR(255) NULL,

	UNIQUE KEY uq_active_token_rules (active_token_rules),

	CONSTRAINT fk_token_id
		FOREIGN KEY (token_id) REFERENCES refresh_token(id)
		ON DELETE CASCADE
		ON UPDATE CASCADE
) ENGINE=InnoDB;

/*
DATA FROM HEADERS AND OTHERS | SALT | SALT INSERTION SEED | STR MIX SEED
ex: User-agent+remote_addr|EWOFK23i35nfwx45|45|65
*/
