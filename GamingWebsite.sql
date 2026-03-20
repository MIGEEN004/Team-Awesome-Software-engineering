-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: db
-- Generation Time: Mar 12, 2026 at 10:47 AM
-- Server version: 9.6.0
-- PHP Version: 8.3.26

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `sd2-db`
--

-- --------------------------------------------------------
-- Table structure for table `Category`
-- --------------------------------------------------------

CREATE TABLE `Category` (
  `CategoryID` int NOT NULL,
  `category_name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- Table structure for table `Listing`
-- --------------------------------------------------------

CREATE TABLE `Listing` (
  `GameID` int NOT NULL,
  `game_name` varchar(100) NOT NULL,
  `platform` varchar(50) DEFAULT NULL,
  `GameCategory` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- Table structure for table `Tip`
-- --------------------------------------------------------

CREATE TABLE `Tip` (
  `TipID` int NOT NULL,
  `tip_title` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `tip_content` text NOT NULL,
  `date_created` datetime DEFAULT CURRENT_TIMESTAMP,
  `UserID` int DEFAULT NULL,
  `GameID` int DEFAULT NULL,
  `CategoryID` int DEFAULT NULL,
  `Votes` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- Table structure for table `Users`
-- --------------------------------------------------------

CREATE TABLE `Users` (
  `UserID` int NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Bio` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `date_joined` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- Data Insertion (Gaming Content)
-- --------------------------------------------------------

-- Inserting specific categories as requested
INSERT INTO `Category` (`CategoryID`, `category_name`) VALUES
(1, 'Guide'),
(2, 'Q&A'),
(3, 'General'),
(4, 'Tips');

-- Adding sample users
INSERT INTO `Users` (`UserID`, `username`, `email`, `password`, `Bio`) VALUES
(1, 'DragonSlayer99', 'ds99@example.com', 'hashed_pass_123', 'Love RPGs and speedrunning.'),
(2, 'PixelQueen', 'pq@example.com', 'hashed_pass_456', 'Platformer enthusiast and trophy hunter.');

-- Adding popular games to the listing
INSERT INTO `Listing` (`GameID`, `game_name`, `platform`, `GameCategory`) VALUES
(1, 'Elden Ring', 'PC/PlayStation/Xbox', 1),
(2, 'Hollow Knight', 'PC/Switch', 4),
(3, 'Cyberpunk 2077', 'PC/PlayStation', 3);

-- Adding community tips linked to users and games
INSERT INTO `Tip` (`TipID`, `tip_title`, `tip_content`, `UserID`, `GameID`, `CategoryID`, `Votes`) VALUES
(1, 'How to beat Margit', 'Focus on parrying his slower staff swings and use Spirit Jellyfish for poison damage.', 1, 1, 1, 150),
(2, 'Best Early Game Farm', 'Head to Limgrave near the warmaster hut for easy rune farming.', 2, 1, 4, 45),
(3, 'Path to the City', 'Does anyone know the fastest way to get to the capital after the boss?', 1, 3, 2, 10),
(4, 'Hidden Wall in Mantis Village', 'There is a breakable wall on the far left that leads to a chest with a Wanderer\'s Journal.', 2, 2, 4, 85);

-- --------------------------------------------------------
-- Indexes and Constraints
-- --------------------------------------------------------

ALTER TABLE `Category`
  ADD PRIMARY KEY (`CategoryID`);

ALTER TABLE `Listing`
  ADD PRIMARY KEY (`GameID`),
  ADD KEY `GameCategory` (`GameCategory`);

ALTER TABLE `Tip`
  ADD PRIMARY KEY (`TipID`),
  ADD KEY `UserID` (`UserID`),
  ADD KEY `GameID` (`GameID`),
  ADD KEY `CategoryID` (`CategoryID`);

ALTER TABLE `Users`
  ADD PRIMARY KEY (`UserID`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT settings
--

ALTER TABLE `Category`
  MODIFY `CategoryID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

ALTER TABLE `Listing`
  MODIFY `GameID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

ALTER TABLE `Tip`
  MODIFY `TipID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

ALTER TABLE `Users`
  MODIFY `UserID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for table relationships
--

ALTER TABLE `Listing`
  ADD CONSTRAINT `listing_ibfk_1` FOREIGN KEY (`GameCategory`) REFERENCES `Category` (`CategoryID`) ON DELETE SET NULL;

ALTER TABLE `Tip`
  ADD CONSTRAINT `tip_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `Users` (`UserID`) ON DELETE CASCADE,
  ADD CONSTRAINT `tip_ibfk_2` FOREIGN KEY (`GameID`) REFERENCES `Listing` (`GameID`) ON DELETE CASCADE,
  ADD CONSTRAINT `tip_ibfk_3` FOREIGN KEY (`CategoryID`) REFERENCES `Category` (`CategoryID`) ON DELETE SET NULL;

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;