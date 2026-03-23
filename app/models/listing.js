const db = require('../services/db');

class Game {
    id;
    title;
    platform;
    category;

    constructor(id, title, platform, category) {
        this.id = id;
        this.title = title;
        this.platform = platform;
        this.category = category;
    }

    // Static method to get all games for the listing page
    static async getAllGames() {
        // UPDATE: Changed table name to 'Listing' and field names to match schema
        var sql = "SELECT GameID, game_name, platform, GameCategory FROM Listing";
        const results = await db.query(sql);
        
        // Map the database rows to Game Objects
        return results.map(row => new Game(row.GameID, row.game_name, row.platform, row.GameCategory));
    }
}

module.exports = { Game };