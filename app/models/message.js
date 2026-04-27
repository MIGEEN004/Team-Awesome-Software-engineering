const db = require('./../services/db');

class Message {
    constructor(id, sender_id, message_text, game_id, created_at = null) {
        this.id = id;
        this.sender_id = Number(sender_id);
        this.message_text = message_text;
        this.game_id = Number(game_id);
        this.created_at = created_at;
    }

    // CREATE: Adds a new post to the forum
    async saveToDatabase() {
        try {
            // Changed the last parameter from 0 to null
            const sql = "INSERT INTO Messages (sender_id, message_text, game_id, receiver_id) VALUES (?, ?, ?, NULL)";
            const params = [this.sender_id, this.message_text, this.game_id];
            const result = await db.query(sql, params);
            this.id = result.insertId;
            return this.id;
        } catch (err) {
            console.error("CRUD Error (Create):", err.sqlMessage || err);
            throw err;
        }
    }

    // READ: Gets all messages for a specific game forum
    static async getChatHistory(gameId) {
        try {
            const sql = `
                SELECT m.*, u.username 
                FROM Messages m 
                JOIN Users u ON m.sender_id = u.UserID 
                WHERE m.game_id = ? 
                ORDER BY m.created_at ASC`;
            
            const results = await db.query(sql, [gameId]);
            return results; 
        } catch (err) {
            console.error("CRUD Error (Read):", err);
            throw err;
        }
    }
}

module.exports = { Message };