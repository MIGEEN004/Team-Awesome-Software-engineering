const db = require('./../services/db');

class User {
    id;
    username;
    bio;
    dateJoined;
    tips = []; 

    constructor(id) {
        this.id = id;
    }
    
    async getUserDetails() {
        // FIX: Changed 'id' to 'UserID' to match your database
        var sql = "SELECT * from Users where UserID = ?"
        const results = await db.query(sql, [this.id]);
        
        if (results.length > 0) {
            this.username = results[0].username;
            // FIX: 'Bio' is capitalized in your DB screenshot
            this.bio = results[0].Bio; 
            this.dateJoined = results[0].date_joined;
        }
    }
    
    async getUserTips() {
        // FIX: Ensure table name 'Tip' matches your DB
        var sql = "SELECT * FROM Tip WHERE UserID = ? LIMIT 3";
        const results = await db.query(sql, [this.id]);
        this.tips = results; 
    }
}

module.exports = { User };