const db = require('../services/db');

class Game {
    constructor(id, title, platform) {
        this.id = id;
        this.title = title;
        this.platform = platform;
    }

    static async getAllGames() {
        const sql = "SELECT GameID, game_name, platform FROM Listing";
        const results = await db.query(sql);
        return results.map(row => new Game(row.GameID, row.game_name, row.platform));
    }

    static async getGameById(id) {
        const sql = "SELECT * FROM Listing WHERE GameID = ?";
        const results = await db.query(sql, [id]);
        return results.length ? new Game(results[0].GameID, results[0].game_name, results[0].platform) : null;
    }
}
module.exports = { Game };