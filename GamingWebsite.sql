-- Create Table structure for table `Category`
CREATE TABLE `Category` (
  `CategoryID` int NOT NULL AUTO_INCREMENT,
  `category_name` varchar(100) NOT NULL,
  PRIMARY KEY (`CategoryID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create Table structure for table `Users`
CREATE TABLE `Users` (
  `UserID` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(100) NOT NULL,
  `Bio` varchar(250) DEFAULT NULL,
  `date_joined` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`UserID`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create Table structure for table `Listing`
CREATE TABLE `Listing` (
  `GameID` int NOT NULL AUTO_INCREMENT,
  `game_name` varchar(100) NOT NULL,
  `platform` varchar(50) DEFAULT NULL,
  `GameCategory` int DEFAULT NULL,
  PRIMARY KEY (`GameID`),
  FOREIGN KEY (`GameCategory`) REFERENCES `Category` (`CategoryID`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create Table structure for table `Tip`
CREATE TABLE `Tip` (
  `TipID` int NOT NULL AUTO_INCREMENT,
  `tip_title` varchar(100) NOT NULL,
  `tip_content` text NOT NULL,
  `date_created` datetime DEFAULT CURRENT_TIMESTAMP,
  `UserID` int DEFAULT NULL,
  `GameID` int DEFAULT NULL,
  `CategoryID` int DEFAULT NULL,
  `Votes` int NOT NULL DEFAULT 0,
  PRIMARY KEY (`TipID`),
  FOREIGN KEY (`UserID`) REFERENCES `Users` (`UserID`) ON DELETE CASCADE,
  FOREIGN KEY (`GameID`) REFERENCES `Listing` (`GameID`) ON DELETE CASCADE,
  FOREIGN KEY (`CategoryID`) REFERENCES `Category` (`CategoryID`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Sample Data for "Sharing, exchange and building community" theme
INSERT INTO `Category` (`category_name`) VALUES ('Guide'), ('Q&A'), ('General'), ('Tips');

INSERT INTO `Users` (`username`, `email`, `password`, `Bio`) VALUES 
('DragonSlayer99', 'ds99@example.com', 'hashed_pass_123', 'Love RPGs and speedrunning.'),
('PixelQueen', 'pq@example.com', 'hashed_pass_456', 'Platformer enthusiast and trophy hunter.');

INSERT INTO `Listing` (`game_name`, `platform`, `GameCategory`) VALUES 
('Elden Ring', 'PC/PlayStation/Xbox', 1),
('Hollow Knight', 'PC/Switch', 4),
('Cyberpunk 2077', 'PC/PlayStation', 3);

INSERT INTO `Tip` (`tip_title`, `tip_content`, `UserID`, `GameID`, `CategoryID`, `Votes`) VALUES 
('How to beat Margit', 'Focus on parrying his slower staff swings...', 1, 1, 1, 150),
('Best Early Game Farm', 'Head to Limgrave near the warmaster hut...', 2, 1, 4, 45);

CREATE TABLE Messages ( 

    MessageID INT AUTO_INCREMENT PRIMARY KEY, 

    sender_id INT NOT NULL, 

    receiver_id INT NOT NULL, 

    game_id INT DEFAULT NULL, 

    message_text TEXT NOT NULL, 

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 

    FOREIGN KEY (sender_id) REFERENCES Users(UserID), 

    FOREIGN KEY (receiver_id) REFERENCES Users(UserID), 

    FOREIGN KEY (game_id) REFERENCES Listing(GameID) 

);