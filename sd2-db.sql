-- 1. Drop tables in reverse order to prevent Foreign Key errors
DROP TABLE IF EXISTS `Tips`;
DROP TABLE IF EXISTS `Games`;
DROP TABLE IF EXISTS `Categories`;
DROP TABLE IF EXISTS `Users`;

-- 2. Users Table (Combining your new auth fields with the profile structure)
CREATE TABLE `Users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL UNIQUE,
  `email` varchar(100) NOT NULL UNIQUE,
  `password` varchar(100) NOT NULL,
  `bio` varchar(250) DEFAULT NULL,
  `date_joined` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Categories Table (From your custom schema)
CREATE TABLE `Categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `category_name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Games Table (Your 'Listing' table, renamed to match your Node models)
CREATE TABLE `Games` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL,
  `platform` varchar(50) DEFAULT NULL,
  `category_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`category_id`) REFERENCES `Categories`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Tips Table (Your custom Tip table, replacing the old 'Posts' concept)
CREATE TABLE `Tips` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL,
  `content` text NOT NULL,
  `votes` int DEFAULT 0,
  `date_created` datetime DEFAULT CURRENT_TIMESTAMP,
  `user_id` int NOT NULL,
  `game_id` int NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `Users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`game_id`) REFERENCES `Games`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==========================================
-- SPRINT 3: INSERTING DUMMY COMMUNITY DATA
-- ==========================================

INSERT INTO `Users` (`username`, `email`, `password`, `bio`) VALUES
('AdaLovelace', 'ada@example.com', 'hashed_pass_1', 'Love sharing co-op games and building communities!'),
('AlanTuring', 'alan@example.com', 'hashed_pass_2', 'Always looking for a new puzzle game partner.');

INSERT INTO `Categories` (`category_name`) VALUES
('Simulation/Co-op'), 
('Co-op Adventure'), 
('Community Building');

INSERT INTO `Games` (`title`, `platform`, `category_id`) VALUES
('Stardew Valley', 'PC', 1),
('It Takes Two', 'PlayStation', 2),
('Animal Crossing', 'Nintendo Switch', 3);

INSERT INTO `Tips` (`title`, `content`, `votes`, `user_id`, `game_id`) VALUES
('Best crops for Year 1?', 'Make sure to plant plenty of strawberries in Spring to maximize your community fund!', 15, 1, 1),
('How to beat the vacuum boss', 'Communication is key! One person sucks, the other aims.', 20, 2, 2),
('Looking for a Stardew Farm partner!', 'I usually play evenings on PC. Add me!', 5, 1, 1);