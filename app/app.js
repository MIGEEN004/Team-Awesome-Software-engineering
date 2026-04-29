// Import express.js
const express = require("express");

// Create express app
var app = express();

// Add static files location (for CSS/Images)
app.use(express.static("static"));

// Use the Pug templating engine
app.set('view engine', 'pug');
app.set('views', './app/views');

// Get the functions in the db.js file to use
const db = require('./services/db');

// Import models
const { User } = require("./models/user");
const { Game } = require("./models/listing");

// --- ROUTES ---

// 1. Home Page (index.pug)
app.get("/", function(req, res) {
    res.render("index");
});

// 2. All Listings Page (all-listings.pug)
app.get("/all-listings", async function(req, res) {
    try {
        const games = await Game.getAllGames();
        // Passing 'games' as 'data' to match all-listings.pug
        res.render('all-listings', { data: games });
    } catch (err) {
        console.error("Error fetching listings:", err);
        res.status(500).send("Database Error.");
    }
});

// 3. Listing Detail Page (listing-detail.pug)
app.get("/listing-single/:id", async function(req, res) {
    try {
        const gameId = req.params.id;
        // Fetching single game data directly from DB
        const sql = "SELECT GameID as id, game_name as Title, platform, GameCategory as category FROM Listing WHERE GameID = ?";
        const results = await db.query(sql, [gameId]);
        
        if (results.length > 0) {
            const gameData = {
                ...results[0],
                Description: "A community-shared game tip.",
                Price: 0, // Mutual benefit theme
                User_ID: 1 
            };
            res.render('listing-detail', { game: gameData });
        } else {
            res.status(404).send("Game not found.");
        }
    } catch (err) {
        console.error("Error fetching game detail:", err);
        res.status(500).send("Database Error.");
    }
});

// 4. Category Results Page (category-results.pug)
app.get("/category/:id", async function(req, res) {
    try {
        const catId = req.params.id;
        const sql = "SELECT * FROM Listing WHERE GameCategory = ?";
        const listings = await db.query(sql, [catId]);
        
        const catSql = "SELECT category_name FROM Category WHERE CategoryID = ?";
        const catResult = await db.query(catSql, [catId]);
        const categoryName = catResult.length > 0 ? catResult[0].category_name : "Category";

        res.render('category-results', { 
            categoryName: categoryName, 
            listings: listings 
        });
    } catch (err) {
        console.error("Error fetching category results:", err);
        res.status(500).send("Database Error.");
    }
});

// 5. User Profile Page (user-profile.pug)
app.get("/user-profile/:id", async function (req, res) {
    try {
        const uId = req.params.id;
        const user = new User(uId);
        await user.getUserDetails(); 
        await user.getUserTips();    
        
        res.render('user-profile', { user: user });
    } catch (err) {
        console.error("Error fetching user profile:", err);
        res.status(500).send("Database Error.");
    }
});

// Export the app object so it can be used by index.js and testing frameworks
module.exports = app;