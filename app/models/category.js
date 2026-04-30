// app/models/category.js
const db = require('../services/db');

class Category {
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }

    static async getAllCategories() {
        const sql = "SELECT * FROM Category";
        const results = await db.query(sql);
        return results.map(row => new Category(row.CategoryID, row.category_name));
    }
}

module.exports = { Category };