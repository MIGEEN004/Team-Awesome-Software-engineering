const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_KEY = '299b45675fe44a96aea6c2ff1c417f02';
// Pulling just a few titles from your sd2-db.sql as an example[cite: 2]
const games = [
{ id: 1, title: 'The Legend of Zelda: Breath of the Wild' },
  { id: 2, title: 'Super Mario 64' },
  { id: 3, title: 'Final Fantasy VII' },
  { id: 4, title: 'Halo: Combat Evolved' },
  { id: 5, title: 'God of War (2018)' },
  { id: 6, title: 'Elden Ring' },
  { id: 7, title: 'Minecraft' },
  { id: 8, title: 'Grand Theft Auto V' },
  { id: 9, title: 'The Witcher 3: Wild Hunt' },
  { id: 10, title: 'Tetris' },
  { id: 11, title: 'Doom (1993)' },
  { id: 12, title: 'Resident Evil 4' },
  { id: 13, title: 'Metal Gear Solid' },
  { id: 14, title: 'Street Fighter II' },
  { id: 15, title: 'Stardew Valley' },
  { id: 16, title: 'Dark Souls' },
  { id: 17, title: 'Metroid Dread' },
  { id: 18, title: 'Portal 2' },
  { id: 19, title: 'Call of Duty: Modern Warfare' },
  { id: 20, title: 'Animal Crossing: New Horizons' },
  { id: 21, title: 'Pokémon Red' },
  { id: 22, title: 'Sonic the Hedgehog' },
  { id: 23, title: 'Red Dead Redemption 2' },
  { id: 24, title: 'BioShock' },
  { id: 25, title: 'Mass Effect 2' },
  { id: 26, title: 'Chrono Trigger' },
  { id: 27, title: 'Tony Hawks Pro Skater 2' },
  { id: 28, title: 'Gran Turismo 3' },
  { id: 29, title: 'Civilization VI' },
  { id: 30, title: 'Hades' },
  { id: 31, title: 'The Last of Us Part I' },
  { id: 32, title: 'Persona 5' },
  { id: 33, title: 'Bloodborne' },
  { id: 34, title: 'Sekiro: Shadows Die Twice' },
  { id: 35, title: 'Forza Horizon 5' },
  { id: 36, title: 'Fallout: New Vegas' },
  { id: 37, title: 'Overwatch' },
  { id: 38, title: 'Devil May Cry 5' },
  { id: 39, title: 'Pac-Man' },
  { id: 40, title: 'Super Smash Bros. Ultimate' },
  { id: 41, title: 'Half-Life 2' },
  { id: 42, title: 'Counter-Strike: Global Offensive' },
  { id: 43, title: 'World of Warcraft' },
  { id: 44, title: 'Diablo II' },
  { id: 45, title: 'SimCity 2000' },
  { id: 46, title: 'Mortal Kombat II' },
  { id: 47, title: 'Castlevania: Symphony of the Night' },
  { id: 48, title: 'GoldenEye 007' },
  { id: 49, title: 'StarCraft' },
  { id: 50, title: 'Age of Empires II' },
  { id: 51, title: 'Spelunky' },
  { id: 52, title: 'Celeste' },
  { id: 53, title: 'Cuphead' },
  { id: 54, title: 'Undertale' },
  { id: 55, title: 'Outer Wilds' },
  { id: 56, title: 'Disco Elysium' },
  { id: 57, title: 'It Takes Two' },
  { id: 58, title: 'Banjo-Kazooie' },
  { id: 59, title: 'Shadow of the Colossus' },
  { id: 60, title: 'Spyro the Dragon' },
  { id: 61, title: 'Crash Bandicoot' },
  { id: 62, title: 'Silent Hill 2' },
  { id: 63, title: 'Tekken 3' },
  { id: 64, title: 'Monster Hunter: World' },
  { id: 65, title: 'F-Zero GX' },
  { id: 66, title: 'Dead Space' },
  { id: 67, title: 'Mass Effect' },
  { id: 68, title: 'Dragon Age: Origins' },
  { id: 69, title: 'Gears of War' },
  { id: 70, title: 'Left 4 Dead 2' },
  { id: 71, title: 'Portal' },
  { id: 72, title: 'Star Fox 64' },
  { id: 73, title: 'Donkey Kong Country' },
  { id: 74, title: 'Mega Man X' },
  { id: 75, title: 'Kingdom Hearts' },
  { id: 76, title: 'Final Fantasy X' },
  { id: 77, title: 'XCOM: Enemy Unknown' },
  { id: 78, title: 'Slay the Spire' },
  { id: 79, title: 'RimWorld' },
  { id: 80, title: 'Cities: Skylines' },
  { id: 81, title: 'Microsoft Flight Simulator' },
  { id: 82, title: 'The Sims 4' },
  { id: 83, title: 'Total War: Warhammer II' },
  { id: 84, title: 'Dota 2' },
  { id: 85, title: 'League of Legends' },
  { id: 86, title: 'Rocket League' },
  { id: 87, title: 'FIFA 23' },
  { id: 88, title: 'NBA 2K23' },
  { id: 89, title: 'Pikmin' },
  { id: 90, title: 'Wii Sports' },
  { id: 91, title: 'Nintendogs' },
  { id: 92, title: 'Brain Age' },
  { id: 93, title: 'Advance Wars' },
  { id: 94, title: 'Fire Emblem: Three Houses' },
  { id: 95, title: 'Ghost of Tsushima' },
  { id: 96, title: 'Horizon Zero Dawn' },
  { id: 97, title: 'Ratchet & Clank: Rift Apart' },
  { id: 98, title: 'Sly Cooper and the Thievius Raccoonus' },
  { id: 99, title: 'Jak and Daxter: The Precursor Legacy' },
  { id: 100, title: 'God of War II' }
];

async function downloadCovers() {
  for (const game of games) {
    try {
      // 1. Search for the game
      const searchRes = await axios.get(`https://api.rawg.io/api/games?key=${API_KEY}&search=${encodeURIComponent(game.title)}`);
      if (searchRes.data.results.length > 0) {
        const imageUrl = searchRes.data.results[0].background_image;
        
        // 2. Download and rename to [ID].jpg 💀
        const response = await axios({ url: imageUrl, responseType: 'stream' });
        const filePath = path.join(__dirname, 'static/images/covers', `${game.id}.jpg`);
        
        response.data.pipe(fs.createWriteStream(filePath));
        console.log(`Saved: ${game.title} as ${game.id}.jpg`);
      }
    } catch (err) {
      console.error(`Failed to reap ${game.title}:`, err.message);
    }
  }
}

downloadCovers();