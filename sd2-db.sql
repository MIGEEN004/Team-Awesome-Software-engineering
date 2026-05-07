-- Create Platforms Table
CREATE TABLE IF NOT EXISTS platforms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

-- Create Tags Table
CREATE TABLE IF NOT EXISTS tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

-- Create the main Games Table (Added metacritic_score here)
CREATE TABLE IF NOT EXISTS games (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    release_year INT,
    description TEXT,
    metacritic_score INT
);

-- Create Junction Tables
CREATE TABLE IF NOT EXISTS game_tags (
    game_id INT,
    tag_id INT,
    PRIMARY KEY (game_id, tag_id),
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS game_platforms (
    game_id INT,
    platform_id INT,
    PRIMARY KEY (game_id, platform_id),
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
    FOREIGN KEY (platform_id) REFERENCES platforms(id) ON DELETE CASCADE
);

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    nickname VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    date_joined TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    bio TEXT
);

CREATE TABLE flairs(
    id INT AUTO_INCREMENT PRIMARY KEY,
    Flair_Name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    flair_id INT,
    game VARCHAR(255),
    platform VARCHAR(255),
    post_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_rating INT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (flair_id) REFERENCES flairs(id) ON DELETE SET NULL
);

CREATE TABLE post_ratings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    rating_value INT NOT NULL, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (post_id, user_id)
);

CREATE TABLE comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    comment_text TEXT NOT NULL,
    comment_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create Replies Table
CREATE TABLE IF NOT EXISTS replies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    comment_id INT NOT NULL,
    user_id INT NOT NULL,
    reply_text TEXT NOT NULL,
    reply_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    message_text TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert Platform Data
INSERT INTO platforms (name) VALUES
    ('Windows'),
    ('Android'),
    ('Game Boy'),
    ('Game Boy Color'),
    ('Game Boy Advance'),
    ('Nintendo 64'),
    ('Nintendo GameCube'),
    ('Nintendo Wii'),
    ('Nintendo Wii U'),
    ('Nintendo Switch'),
    ('PlayStation'),
    ('PlayStation 2'),
    ('PlayStation 3'),
    ('PlayStation 4'),
    ('PlayStation 5'),
    ('Xbox'),
    ('Xbox 360'),
    ('Xbox One'),
    ('Xbox Series X/S'),
    ('Nintendo DS'),
    ('Nintendo 3DS'),
    ('New Nintendo 3DS'),
    ('PlayStation Portable'),
    ('PlayStation Vita'),
    ('Sega Genesis'),
    ('Sega Saturn'),
    ('Sega Dreamcast'),
    ('Sega Game Gear'),
    ('Sega Master System'),
    ('Sega CD'),
    ('Sega 32X');


-- Insert Tag Data (Extracted from your screenshot)
INSERT INTO tags (name) VALUES
    ('Action'),
    ('Action Adventure'),
    ('Adventure'),
    ('Hardware'),
    ('Miscellaneous'),
    ('Puzzle'),
    ('Racing'),
    ('Role-Playing'),
    ('Simulation'),
    ('Sports'),
    ('Strategy');


INSERT INTO games (title, release_year, description, metacritic_score) VALUES
('The Legend of Zelda: Breath of the Wild', 2017, 'An open-world action-adventure game set in the kingdom of Hyrule.', 97),
('Super Mario 64', 1996, 'The first 3D platformer featuring Mario in a quest to save Peach.', 94),
('Final Fantasy VII', 1997, 'A revolutionary RPG following Cloud Strife against Sephiroth.', 92),
('Halo: Combat Evolved', 2001, 'The sci-fi shooter that defined a generation of console gaming.', 97),
('God of War (2018)', 2018, 'Kratos travels through Norse mythology with his son Atreus.', 94),
('Elden Ring', 2022, 'A massive open-world RPG from FromSoftware and George R.R. Martin.', 96),
('Minecraft', 2011, 'A sandbox building game that allows infinite creativity.', 93),
('Grand Theft Auto V', 2013, 'Three criminals work together to pull off a series of heists.', 97),
('The Witcher 3: Wild Hunt', 2015, 'Geralt of Rivia searches for his adopted daughter in a war-torn world.', 93),
('Tetris', 1984, 'The classic tile-matching puzzle game.', 89),
('Doom (1993)', 1993, 'The foundational first-person shooter set on Mars.', 90),
('Resident Evil 4', 2005, 'Leon S. Kennedy rescues the Presidents daughter from a cult.', 96),
('Metal Gear Solid', 1998, 'Tactical espionage action featuring Solid Snake.', 94),
('Street Fighter II', 1991, 'The definitive competitive fighting game.', 93),
('Stardew Valley', 2016, 'A cozy farming and life simulation game.', 89),
('Dark Souls', 2011, 'A challenging action RPG known for its deep lore and difficulty.', 89),
('Metroid Dread', 2021, 'Samus Aran explores a dangerous alien planet in 2D.', 88),
('Portal 2', 2011, 'A physics-based puzzle game involving teleportation portals.', 95),
('Call of Duty: Modern Warfare', 2007, 'A cinematic military shooter that changed the genre.', 94),
('Animal Crossing: New Horizons', 2020, 'Create your own island paradise with animal friends.', 90),
('Pokémon Red', 1996, 'The original quest to catch all 151 Pokémon.', 89),
('Sonic the Hedgehog', 1991, 'The fastest hedgehog in the world battles Dr. Robotnik.', 81),
('Red Dead Redemption 2', 2018, 'An epic tale of life in Americas unforgiving heartland.', 97),
('BioShock', 2007, 'A philosophical shooter set in the underwater city of Rapture.', 96),
('Mass Effect 2', 2010, 'Commander Shepard assembles a team to save the galaxy.', 96),
('Chrono Trigger', 1995, 'A time-traveling RPG masterpiece.', 92),
('Tony Hawks Pro Skater 2', 2000, 'The peak of arcade-style skateboarding games.', 98),
('Gran Turismo 3', 2001, 'A realistic driving simulator for racing enthusiasts.', 95),
('Civilization VI', 2016, 'Build an empire to stand the test of time.', 88),
('Hades', 2020, 'A rogue-like dungeon crawler set in the Greek underworld.', 93),
('The Last of Us Part I', 2013, 'A grounded story of survival in a post-fungal world.', 95),
('Persona 5', 2016, 'High schoolers lead double lives as Phantom Thieves.', 93),
('Bloodborne', 2015, 'Face your fears in the gothic city of Yharnam.', 92),
('Sekiro: Shadows Die Twice', 2019, 'A shinobi seeks revenge in Sengoku-era Japan.', 90),
('Forza Horizon 5', 2021, 'An open-world racing festival set in Mexico.', 92),
('Fallout: New Vegas', 2010, 'A post-apocalyptic RPG set in the Mojave Wasteland.', 84),
('Overwatch', 2016, 'A team-based hero shooter.', 91),
('Devil May Cry 5', 2019, 'Stylish action featuring Dante and Nero.', 89),
('Pac-Man', 1980, 'The iconic arcade maze-chaser.', 80),
('Super Smash Bros. Ultimate', 2018, 'The biggest crossover fighting game in history.', 93),
('Half-Life 2', 2004, 'Gordon Freeman resists an alien occupation.', 96),
('Counter-Strike: Global Offensive', 2012, 'The premier tactical team-based shooter.', 83),
('World of Warcraft', 2004, 'The legendary MMORPG set in Azeroth.', 93),
('Diablo II', 2000, 'An addictive action-RPG about slaying demons.', 88),
('SimCity 2000', 1993, 'A classic city-building management simulator.', 90),
('Mortal Kombat II', 1993, 'A gory and iconic fighting game sequel.', 85),
('Castlevania: Symphony of the Night', 1997, 'Alucard explores Draculas castle in this Metroidvania.', 93),
('GoldenEye 007', 1997, 'The definitive console shooter for the N64.', 96),
('StarCraft', 1998, 'Real-time strategy featuring Terrans, Zerg, and Protoss.', 88),
('Age of Empires II', 1999, 'A classic medieval strategy game.', 92),
('Spelunky', 2008, 'A procedurally generated cave-exploration platformer.', 90),
('Celeste', 2018, 'A precision platformer about climbing a mountain.', 92),
('Cuphead', 2017, 'Run-and-gun action with a 1930s cartoon art style.', 88),
('Undertale', 2015, 'An RPG where you do not have to kill anyone.', 92),
('Outer Wilds', 2019, 'A space exploration mystery set in a time loop.', 85),
('Disco Elysium', 2019, 'A dialogue-heavy RPG about a detective solving a case.', 97),
('It Takes Two', 2021, 'A cooperative adventure game about a shrinking couple.', 89),
('Banjo-Kazooie', 1998, 'A platformer featuring a bear and a bird.', 92),
('Shadow of the Colossus', 2005, 'Wander hunts giants to save a girl.', 91),
('Spyro the Dragon', 1998, 'A purple dragon collects gems and saves his kin.', 85),
('Crash Bandicoot', 1996, 'A wacky marsupial runs through linear 3D levels.', 80),
('Silent Hill 2', 2001, 'A psychological horror masterpiece.', 89),
('Tekken 3', 1997, 'The pinnacle of 3D fighting on the original PlayStation.', 96),
('Monster Hunter: World', 2018, 'Hunt giant monsters in a lush ecosystem.', 90),
('F-Zero GX', 2003, 'High-speed futuristic racing.', 89),
('Dead Space', 2008, 'Sci-fi survival horror on a derelict spaceship.', 86),
('Mass Effect', 2007, 'The beginning of an epic space opera.', 91),
('Dragon Age: Origins', 2009, 'A dark fantasy RPG with tactical combat.', 91),
('Gears of War', 2006, 'The cover-based shooter that defined the Xbox 360.', 94),
('Left 4 Dead 2', 2009, 'Co-op zombie slaying survival.', 89),
('Portal', 2007, 'Think with portals in this short puzzle adventure.', 90),
('Star Fox 64', 1997, 'On-rails space combat with Fox McCloud.', 88),
('Donkey Kong Country', 1994, 'Pre-rendered 3D graphics on a 2D SNES platformer.', 88),
('Mega Man X', 1993, 'Fast-paced action platforming with power-ups.', 88),
('Kingdom Hearts', 2002, 'Square Enix and Disney characters collide.', 85),
('Final Fantasy X', 2001, 'Tidus and Yuna travel to defeat Sin.', 92),
('XCOM: Enemy Unknown', 2012, 'Turn-based strategy against an alien invasion.', 89),
('Slay the Spire', 2019, 'A roguelike deck-builder.', 89),
('RimWorld', 2018, 'A sci-fi colony management simulator.', 87),
('Cities: Skylines', 2015, 'The modern standard for city builders.', 85),
('Microsoft Flight Simulator', 2020, 'Fly anywhere in the world in high detail.', 91),
('The Sims 4', 2014, 'Control the lives of virtual people.', 70),
('Total War: Warhammer II', 2017, 'Massive fantasy battles and grand strategy.', 87),
('Dota 2', 2013, 'A highly competitive multiplayer online battle arena.', 90),
('League of Legends', 2009, 'The most popular MOBA in the world.', 78),
('Rocket League', 2015, 'Soccer played with rocket-powered cars.', 86),
('FIFA 23', 2022, 'The final EA Sports game under the FIFA name.', 76),
('NBA 2K23', 2022, 'The premier professional basketball simulation.', 78),
('Pikmin', 2001, 'Command a small army of plant-like creatures.', 89),
('Wii Sports', 2006, 'The game that brought motion controls to everyone.', 76),
('Nintendogs', 2005, 'Raise and train virtual puppies.', 83),
('Brain Age', 2005, 'Daily puzzles to keep your brain sharp.', 77),
('Advance Wars', 2001, 'Turn-based military tactics.', 92),
('Fire Emblem: Three Houses', 2019, 'Lead students in battle and school life.', 89),
('Ghost of Tsushima', 2020, 'A samurai protects his island during the Mongol invasion.', 83),
('Horizon Zero Dawn', 2017, 'Hunt robotic dinosaurs in a beautiful post-apocalypse.', 89),
('Ratchet & Clank: Rift Apart', 2021, 'Interdimensional platforming action.', 88),
('Sly Cooper and the Thievius Raccoonus', 2002, 'A thieving raccoon sneaks through various levels.', 86),
('Jak and Daxter: The Precursor Legacy', 2001, 'An open-world platformer with no loading screens.', 90),
('God of War II', 2007, 'Kratos takes on the Gods of Olympus.', 93);


-- (GameID, TagID)
-- Tags: 1:Action, 2:Action Adv, 3:Adv, 4:Hardware, 5:Misc, 6:Puzzle, 7:Racing, 8:RPG, 9:Sim, 10:Sports, 11:Strategy
INSERT INTO game_tags (game_id, tag_id) VALUES
(1, 2), (2, 1), (3, 8), (4, 1), (5, 2), (6, 8), (6, 1), (7, 5), (8, 1), (9, 8),
(10, 6), (11, 1), (12, 1), (13, 2), (14, 1), (15, 9), (16, 8), (17, 1), (18, 6), (19, 1),
(20, 9), (21, 8), (22, 1), (23, 2), (24, 1), (25, 8), (26, 8), (27, 10), (28, 7), (29, 11),
(30, 1), (31, 2), (32, 8), (33, 1), (34, 1), (35, 7), (36, 8), (37, 1), (38, 1), (39, 5),
(40, 1), (41, 1), (42, 1), (43, 8), (44, 8), (45, 11), (46, 1), (47, 3), (48, 1), (49, 11),
(50, 11), (51, 1), (52, 1), (53, 1), (54, 8), (55, 3), (56, 8), (57, 2), (58, 1), (59, 2),
(60, 1), (61, 1), (62, 1), (63, 1), (64, 1), (65, 7), (66, 1), (67, 8), (68, 8), (69, 1),
(70, 1), (71, 6), (72, 1), (73, 1), (74, 1), (75, 8), (76, 8), (77, 11), (78, 11), (79, 9),
(80, 9), (81, 9), (82, 9), (83, 11), (84, 1), (85, 1), (86, 10), (87, 10), (88, 10), (89, 11),
(90, 10), (91, 9), (92, 6), (93, 11), (94, 11), (95, 2), (96, 2), (97, 1), (98, 2), (99, 1), (100, 1);


-- (GameID, PlatformID)
-- Platforms: 1:Windows, 10:Switch, 12:PS2, 15:PS5, 19:Xbox Series X, etc.
INSERT INTO game_platforms (game_id, platform_id) VALUES
(1, 10), (1, 9), (2, 6), (3, 11), (3, 1), (4, 16), (4, 1), (5, 14), (5, 1), (6, 1), (6, 15), (6, 19),
(7, 1), (7, 2), (7, 10), (8, 1), (8, 13), (8, 14), (8, 18), (9, 1), (9, 14), (9, 18), (10, 3), (10, 1),
(11, 1), (12, 7), (12, 12), (13, 11), (14, 1), (15, 1), (15, 10), (16, 13), (16, 17), (17, 10), (18, 1), (18, 13),
(19, 1), (19, 17), (20, 10), (21, 3), (22, 25), (23, 1), (23, 14), (23, 18), (24, 1), (24, 13), (25, 1), (25, 13),
(26, 1), (27, 12), (28, 12), (29, 1), (29, 10), (30, 1), (30, 10), (31, 14), (32, 14), (33, 14), (34, 14), (34, 1),
(35, 1), (35, 19), (36, 1), (36, 17), (37, 1), (38, 14), (38, 1), (39, 1), (40, 10), (41, 1), (42, 1), (43, 1),
(44, 1), (45, 1), (46, 12), (47, 11), (48, 6), (49, 1), (50, 1), (51, 1), (52, 1), (52, 10), (53, 1), (53, 10),
(54, 1), (55, 1), (56, 1), (57, 14), (57, 1), (58, 6), (59, 12), (60, 11), (61, 11), (62, 12), (63, 11), (64, 1), (64, 14),
(65, 7), (66, 17), (66, 1), (67, 17), (67, 1), (68, 1), (69, 17), (70, 1), (71, 1), (72, 6), (73, 1), (74, 1),
(75, 12), (76, 12), (77, 1), (78, 1), (79, 1), (80, 1), (81, 1), (82, 1), (83, 1), (84, 1), (85, 1), (86, 1),
(87, 1), (87, 14), (88, 1), (88, 14), (89, 7), (90, 8), (91, 20), (92, 20), (93, 5), (94, 10), (95, 14), (96, 14),
(97, 15), (98, 12), (99, 12), (100, 12);-- Create Platforms Table

ALTER TABLE users ADD COLUMN password VARCHAR(255) NOT NULL;

-- The password for all dummy users is: password123
INSERT INTO users (full_name, nickname, email, password, date_joined, bio) VALUES
('Alice Smith', 'alice', 'alice@example.com', '$2b$10$EHucRVjVVUfiPpcG2a0cP.hTs5ztwCi.oCtiqg2nWV1yVE4.msC5a', CURRENT_TIMESTAMP, 'Alice is a passionate gamer and content creator.'),
('Bob Johnson', 'bob', 'bob@example.com', '$2b$10$EHucRVjVVUfiPpcG2a0cP.hTs5ztwCi.oCtiqg2nWV1yVE4.msC5a', CURRENT_TIMESTAMP, 'Bob is an enthusiastic player and reviewer.'),
('Charlie Brown', 'charlie', 'charlie@example.com', '$2b$10$EHucRVjVVUfiPpcG2a0cP.hTs5ztwCi.oCtiqg2nWV1yVE4.msC5a', CURRENT_TIMESTAMP, 'Charlie loves RPGs and strategy games.'),
('Diana Prince', 'diana', 'diana@example.com', '$2b$10$EHucRVjVVUfiPpcG2a0cP.hTs5ztwCi.oCtiqg2nWV1yVE4.msC5a', CURRENT_TIMESTAMP, 'Diana is a dedicated gamer and content creator.');


INSERT INTO flairs (Flair_Name) VALUES
('Discussion'),
('Question'),
('Review'),
('News'),
('Guide'),
('Memes');

INSERT INTO posts (user_id, title, description, flair_id, game, platform, post_timestamp, total_rating) VALUES
(4, 'Why Breath of the Wild is a masterpiece', 'The physics engine and open-world exploration completely changed how I look at adventure games. Finding Koroks never gets old!', 3, 1, 10, CURRENT_TIMESTAMP, 45),
(1, 'Witcher 3 Next-Gen Update is gorgeous', 'Just booted up the next-gen update. The ray tracing makes Novigrad look absolutely stunning at night. Highly recommend replaying it.', 1, 9, 19, CURRENT_TIMESTAMP, 32),
(3, 'Red Dead Redemption 2 - Arthur Morgan', 'Arthur Morgan is arguably the best written protagonist in gaming history. The character development throughout the story is just brilliant.', 3, 23, 14, CURRENT_TIMESTAMP, 88),
(2, 'Elden Ring build advice needed', 'I am struggling with Malenia. Should I respec to a bleed build or stick with pure strength? Any tips on dodging her Waterfowl Dance?', 2, 6, 15, CURRENT_TIMESTAMP, 15),
(4, 'Should I buy a PS4 just for Bloodborne?', 'I mainly game on PC but Bloodborne looks so good. Is it worth buying a used console just for this one game?', 2, 33, 14, CURRENT_TIMESTAMP, 8),
(1, 'Definitive guide to Stardew Valley Year 1', 'Focus on potatoes in Spring, blueberries in Summer, and cranberries in Fall. Always upgrade your watering can when the forecast predicts rain!', 5, 15, 1, CURRENT_TIMESTAMP, 112),
(3, 'Age of Empires II - Fast Castle build order', 'Here is my standard 27-population fast castle build order for playing Franks. Make sure to push your deer early!', 5, 50, 1, CURRENT_TIMESTAMP, 24),
(2, 'When you finally beat that one Dark Souls boss', 'We all know the feeling. Hands shaking, heart pounding, jumping out of your chair. Praise the sun! \\[T]/', 6, 16, 13, CURRENT_TIMESTAMP, 205),
(1, 'Minecraft 1.20 Update thoughts?', 'What does everyone think of the new armor trims and cherry blossom biomes? I think it adds so much cozy life to the world.', 1, 7, 1, CURRENT_TIMESTAMP, 41);

INSERT INTO comments (post_id, user_id, comment_text, comment_timestamp) VALUES
(1, 2, 'Great post! I enjoyed reading it.', CURRENT_TIMESTAMP),
(1, 3, 'Thanks for sharing your thoughts!', CURRENT_TIMESTAMP),
(2, 1, 'I agree, this game is fantastic!', CURRENT_TIMESTAMP),
(3, 4, 'These tips are really helpful, thanks!', CURRENT_TIMESTAMP);

-- Insert dummy data for testing
INSERT INTO replies (comment_id, user_id, reply_text) VALUES 
(1, 1, 'Thanks, Bob! Glad you liked it.'),
(1, 4, 'I agree with Bob, very well written.');

-- Run this to change the column to an integer for counting stars
ALTER TABLE posts MODIFY total_rating INT DEFAULT 0;

