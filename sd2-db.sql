-- Drop tables if they exist (to ensure a clean slate)
DROP TABLE IF EXISTS `posts`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `games`;

-- Create the Games table
CREATE TABLE `games` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `platform` varchar(100) NOT NULL,
  `category` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create the Users table
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `bio` text,
  `date_joined` date NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create the Posts table (Linked to Users)
CREATE TABLE `posts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `Users`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- INSERT DUMMY DATA FOR SPRINT 3
-- --------------------------------------------------------

-- Inserting Community-Focused Games
INSERT INTO `games` (`title`, `platform`, `category`) VALUES
('Stardew Valley', 'PC', 'Simulation/Co-op'),
('It Takes Two', 'PlayStation', 'Co-op Adventure'),
('Animal Crossing', 'Nintendo Switch', 'Community Building');

-- Inserting Dummy Users
INSERT INTO `users` (`name`, `bio`, `date_joined`) VALUES
('Ada Lovelace', 'Love sharing co-op games and building communities!', '2026-01-15'),
('Alan Turing', 'Always looking for a new puzzle game partner.', '2026-02-20');

-- Inserting Dummy Posts for the User Profile
INSERT INTO `posts` (`user_id`, `title`) VALUES
(1, 'Anyone want to start a new Stardew farm together?'),
(1, 'Top 10 Couch Co-op Games for this weekend'),
(2, 'Looking for an It Takes Two partner!');