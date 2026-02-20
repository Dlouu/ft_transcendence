CREATE DATABASE IF NOT EXISTS users_data
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE users_data;

CREATE TABLE IF NOT EXISTS users (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

	user_id BIGINT UNSIGNED NOT NULL UNIQUE, #?
	username VARCHAR(255) NULL, #????????????????????????????
	profile_picture_url VARCHAR(255) NOT NULL,

	is_active BOOLEAN NOT NULL DEFAULT TRUE,

	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

	UNIQUE KEY uq_users_username (username)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS card_gallery (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

	user_id BIGINT UNSIGNED NOT NULL,
	img_url VARCHAR(255) NOT NULL,

	CONSTRAINT fk_user_id
		FOREIGN KEY (user_id) REFERENCES users(user_id)
		ON DELETE CASCADE
		ON UPDATE CASCADE
) ENGINE=InnoDB;


CREATE TABLE IF NOT EXISTS friends (

	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

	requester_id BIGINT UNSIGNED NOT NULL,
	accepter_id  BIGINT UNSIGNED NOT NULL,

	status ENUM('pending', 'accepted', 'rejected', 'blocked')
		NOT NULL DEFAULT 'pending',

	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

	CONSTRAINT fk_requester
		FOREIGN KEY (requester_id)
		REFERENCES users(id)
		ON DELETE CASCADE,
	
	CONSTRAINT fk_accepter
		FOREIGN KEY (accepter_id)
		REFERENCES users(id)
		ON DELETE CASCADE,

	CONSTRAINT unique_friendship
		UNIQUE (requester_id, accepter_id),

	INDEX idx_requester (requester_id),
	INDEX idx_accepter (accepter_id),

	CHECK (requester_id <> accepter_id)

) ENGINE=Innodb;