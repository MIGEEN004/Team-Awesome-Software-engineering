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
const { User } = require("./models/user");
const { Listing } = require("./models/listing");

// Create a route for root - /
app.get("/", function(req, res) {
    res.render("index");
});

// Task: Display a formatted list of all games (The Listing Page)
// UPDATED: Using async/await for better error handling and consistency
app.get("/all-listings", async function(req, res) {
    try {
        var sql = 'select * from Listing';
        // Wait for the database to return results
        const results = await db.query(sql);
        
        // Send the results to the all-listings template
        res.render('all-listings', {data: results});
    } catch (err) {
        console.error("Error fetching listings:", err);
        res.status(500).send("Database Error");
    }
});

// Shows the user's name, bio, date joined, and their "Featured Posts" (Tips)
app.get("/user-profile/:id", async function (req, res) {
    var uId = req.params.id;
    
    // Create a user class with the ID passed
    var user = new User(uId);
    
    await user.getUserDetails(); // Gets name, bio, date_joined
    await user.getUserTips();    // Gets the posts for the right-hand side
    
    console.log(user);
    res.render('user-profile', {user: user});
});

// Start server on port 3000
app.listen(3000, function(){
    console.log(`Server running at http://127.0.0.1:3000/`);
});