// Import express.js
const express = require("express");

// Create express app
var app = express();

// Add static files location (for CSS/Images)
app.use(express.static("static"));

// Middleware for POST requests (Messaging) - REQUIRED for chat to work
app.use(express.urlencoded({ extended: true })); 

// Use the Pug templating engine
app.set('view engine', 'pug');
app.set('views', './app/views');

// Get the functions in the db.js file to use
const db = require('./services/db');

// Import models
const { User } = require("./models/user");
const { Game } = require("./models/listing");
const { Message } = require("./models/message"); 

// --- EXISTING ROUTES ---

app.get("/", function(req, res) {
    res.render("index");
});

app.get("/all-listings", async function(req, res) {
    try {
        const games = await Game.getAllGames();
        res.render('all-listings', { data: games });
    } catch (err) {
        console.error("Error fetching listings:", err);
        res.status(500).send("Database Error.");
    }
});

app.get("/listing-single/:id", async function(req, res) {
    try {
        const gameId = req.params.id;
        const sql = "SELECT GameID as id, game_name as Title, platform, GameCategory as category FROM Listing WHERE GameID = ?";
        const results = await db.query(sql, [gameId]);
        
        if (results.length > 0) {
            const gameData = {
                ...results[0],
                Description: "A community-shared game tip.",
                Price: 0,
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

// --- MESSAGING & FORUM ROUTES ---

// Route to view the forum/chat (Public) with Search functionality
app.get("/chat/:gameId", async function(req, res) {
    try {
        const senderId = 1; // Updated to 1 to match existing UserID in DB
        const gameId = req.params.gameId; 
        const searchQuery = req.query.search || ""; 

        let history;
        if (searchQuery) {
            const sql = "SELECT * FROM Messages WHERE game_id = ? AND message_text LIKE ? ORDER BY created_at ASC";
            history = await db.query(sql, [gameId, `%${searchQuery}%`]);
        } else {
            history = await Message.getChatHistory(gameId);
        }

        res.render('chat', {
            messages: history,
            currentUserId: senderId,
            gameId: gameId,
            searchQuery: searchQuery 
        });
    } catch (err) {
        console.error("DATABASE OR RENDER ERROR:", err.message);
        res.status(500).send("Chat Error");
    }
});

// Route to process sending a message (CRUD: Create)
app.post("/send-message", async function(req, res) {
    try {
        const senderId = 1; // Updated to 1 to match existing UserID in DB
        const { message_text, gameId } = req.body;

        const newMessage = new Message(null, senderId, message_text, gameId);
        
        await newMessage.saveToDatabase();

        res.redirect(`/chat/${gameId}`);
    } catch (err) {
        console.error("Send message error:", err);
        res.status(500).send("Failed to send message");
    }
});

// Route to delete a message (CRUD: Delete)
app.post("/delete-message/:messageId", async function(req, res) {
    try {
        const messageId = req.params.messageId;
        const gameId = req.body.gameId;
        const sql = "DELETE FROM Messages WHERE MessageID = ?";
        await db.query(sql, [messageId]);
        res.redirect(`/chat/${gameId}`);
    } catch (err) {
        console.error("Delete error:", err);
        res.status(500).send("Failed to delete message");
    }
});

// Start server
app.listen(3000, function(){
    console.log(`Server running at http://127.0.0.1:3000/`);
});