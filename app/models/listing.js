// Get the functions in the db.js file to use
const db = require('../services/db');

class Listing {
    gameID;
    gameName;

    constructor(id, name) {
        this.gameID = id;
        this.gameName = name;
    }

    // --- NEW METHOD: This is what app.js is looking for ---
    static async getAllGames() {
        // We use 'as id' and 'as Title' to match what your Pug files expect
        const sql = "SELECT GameID as id, game_name as Title, platform, GameCategory as category FROM Listing";
        const results = await db.query(sql);
        return results; 
    }

    async getGameDetails() {
        if (typeof this.gameName !== 'string') {
            var sql = "SELECT * from Listing where GameID = ?"
            const results = await db.query(sql, [this.gameID]);
            this.gameName = results[0].game_name;
        }
    }
}

module.exports = {
    Game: Listing // Exporting it as 'Game' so app.js can use 'const { Game } = require...'
}