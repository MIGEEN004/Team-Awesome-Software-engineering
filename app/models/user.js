const db = require('./../services/db');

class User {
    id;
    name;
    bio;
    date_joined;

    constructor(id) {
        this.id = id;
    }

    // Get basic profile info
    async getUserDetails() {
        if (typeof this.name !== 'string') {
            var sql = "SELECT * from Users where id = ?";
            const results = await db.query(sql, [this.id]);
            this.name = results[0].name;
            this.bio = results[0].bio;
            this.date_joined = results[0].date_joined;
        }
    }

    // Get the featured posts for the right-side list in your wireframe
    async getFeaturedPosts() {
        var sql = "SELECT * FROM Posts WHERE user_id = ? LIMIT 3";
        const results = await db.query(sql, [this.id]);
        return results; // Returns an array of posts
    }
}

module.exports = { User };