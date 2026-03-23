// Import express.js
const express = require("express");

// Create express app
var app = express();

// Add static files location
app.use(express.static("static"));

// Use the Pug templating engine
app.set('view engine', 'pug');
app.set('views', './app/views');

// Get the functions in the db.js file to use
const db = require('./services/db');

// Get the gaming models
// Note: listing.js exports { Game }, so we destructure that correctly here
const { User } = require("./models/user");
const { Game } = require("./models/listing");

// Create a route for root - /
app.get("/", function(req, res) {
    res.render("index");
});

// Task: Display a formatted list of all games (The Listing Page)
app.get("/all-listings", async function(req, res) {
    try {
        // Use the static method from the Game model
        const games = await Game.getAllGames();
        
        // Send the game objects to the all-listings template
        res.render('all-listings', {data: games});
    } catch (err) {
        console.error("Error fetching listings:", err);
        res.status(500).send("Database Error: Could not retrieve listings.");
    }
});

// Shows the user's name, bio, date joined, and their "Featured Posts" (Tips)
app.get("/user-profile/:id", async function (req, res) {
    try {
        var uId = req.params.id;
        
        // Create a user instance with the ID passed
        var user = new User(uId);
        
        // Populate the user object with database information
        await user.getUserDetails(); // Gets username, bio, date_joined
        await user.getUserTips();    // Gets the community tips for this user
        
        res.render('user-profile', {user: user});
    } catch (err) {
        console.error("Error fetching user profile:", err);
        res.status(500).send("Database Error: User profile not found.");
    }
});

// Start server on port 3000
app.listen(3000, function(){
    console.log(`Server running at http://127.0.0.1:3000/`);
});