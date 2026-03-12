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


// Create a route for root - /
app.get("/", function(req, res) {
    res.render("index");
});



//User profile page
const { User } = require("./models/user.js");

app.get("/user-profile/:id", async function (req, res) {
    var userId = req.params.id;
    
    // Create the user object
    var user = new User(userId);
    
    // Use the model methods to get data
    await user.getUserDetails();
    var posts = await user.getFeaturedPosts();
    
    // Render the pug template
    res.render('user-profile', {
        user: user,
        posts: posts
    });
});



//Game listing page
// 1. Import the Game model
const { Game } = require("./models/game.js");

// 2. Update the listing route
app.get("/games-listing", async function(req, res) {
    // We call the static method from our Model
    const games = await Game.getAllGames();
    
    
    // Pass the array of Game objects to the view
    res.render("games-listing", {
        title: "Games Hub",
        heading: "All Game Discussions",
        data: games
    });
});

// Start server on port 3000
app.listen(3000,function(){
    console.log(`Server running at http://127.0.0.1:3000/`);
});
