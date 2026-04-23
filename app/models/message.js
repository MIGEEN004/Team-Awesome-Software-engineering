// app/models/message.js
const db = require('./../services/db');

class Message {
    id;
    sender_id;
    receiver_id;
    game_id;
    message_text;
    created_at;

    constructor(id, sender_id, receiver_id, message_text, game_id = null) {
        this.id = id;
        // Convert to Numbers to satisfy Foreign Key constraints
        this.sender_id = Number(sender_id);
        this.receiver_id = Number(receiver_id);
        this.message_text = message_text;
        
        // Handle game_id: if empty/null, set as null, otherwise convert to Number
        if (!game_id || game_id === "" || game_id === "null") {
            this.game_id = null;
        } else {
            this.game_id = Number(game_id);
        }
    }

    async saveToDatabase() {
        try {
            const sql = "INSERT INTO Messages (sender_id, receiver_id, message_text, game_id) VALUES (?, ?, ?, ?)";
            const params = [this.sender_id, this.receiver_id, this.message_text, this.game_id];
            
            const result = await db.query(sql, params);
            this.id = result.insertId;
            return this.id;
        } catch (err) {
            console.error("SQL INSERT ERROR:", err.sqlMessage || err);
            throw err;
        }
    }

    static async getChatHistory(user1, user2) {
        try {
            const sql = `SELECT * FROM Messages 
                         WHERE (sender_id = ? AND receiver_id = ?) 
                         OR (sender_id = ? AND receiver_id = ?) 
                         ORDER BY created_at ASC`;
            
            const results = await db.query(sql, [user1, user2, user2, user1]);
            
            return results.map(row => new Message(
                row.MessageID, 
                row.sender_id, 
                row.receiver_id, 
                row.message_text, 
                row.game_id
            ));
        } catch (err) {
            console.error("Database Error in getChatHistory:", err);
            throw err;
        }
    }
}

module.exports = { Message };