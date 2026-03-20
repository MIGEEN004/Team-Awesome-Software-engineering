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
        var sql = "SELECT * FROM Games";
        const results = await db.query(sql);
        // Map the database rows to Game Objects
        return results.map(row => new Game(row.id, row.title, row.platform, row.category));
    }
}

module.exports = { Game };