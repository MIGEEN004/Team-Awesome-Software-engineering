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

// --- MESSAGING ROUTES ---

// Route to view chat
app.get("/chat/:receiverId", async function(req, res) {
    try {
        const senderId = 111; // SarahDDoS from your DB screenshot
        const receiverId = req.params.receiverId;
        const gameId = req.query.gameId || null;

        // Fetches chat history between sender and receiver
        const history = await Message.getChatHistory(senderId, receiverId);

        res.render('chat', {
            messages: history,
            receiverId: receiverId,
            currentUserId: senderId,
            gameId: gameId
        });
    } catch (err) {
        // Log the actual error to the terminal so you can fix it
        console.error("DATABASE OR RENDER ERROR:", err.message);
        res.status(500).send("Chat Error: " + err.message);
    }
});

// Route to process sending a message
app.post("/send-message", async function(req, res) {
    try {
        const senderId = 111; 
        const { receiverId, message_text, gameId } = req.body;

        // Create message object
        const newMessage = new Message(null, senderId, receiverId, message_text, gameId);
        
        // Save to database
        await newMessage.saveToDatabase();

        // Redirect back to chat page to see the new message
        res.redirect(`/chat/${receiverId}?gameId=${gameId}`);
    } catch (err) {
        console.error("Send message error:", err);
        res.status(500).send("Failed to send message");
    }
});

// Start server
app.listen(3000, function(){
    console.log(`Server running at http://127.0.0.1:3000/`);
});