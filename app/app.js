// 1. Import Express and initialize the app
const express = require('express');
const app = express();

// 2. Import your models
const { User } = require('./models/user');
const { Game } = require('./models/game');

// 3. Configure the View Engine (PUG)
// This tells Express to use PUG and look in the 'app/views' folder
app.set('views', './app/views');
app.set('view engine', 'pug');

// 4. Define your Routes (Our Community Endpoints)
app.get('/', function(req, res) {
    res.render('index');
});

app.get('/games', async function(req, res) {
    try {
        const gamesData = await Game.getAllGames();
        res.render('games-listing', { heading: 'Community Game Library', data: gamesData });
    } catch (err) {
        console.error("Error fetching games:", err);
        res.status(500).send("Error loading the community library");
    }
});

app.get('/profile/:id', async function(req, res) {
    try {
        const userId = req.params.id;
        const user = new User(userId);
        
        await user.getUserDetails();
        const featuredPosts = await user.getFeaturedPosts();
        
        res.render('user-profile', { user: user, posts: featuredPosts });
    } catch (err) {
        console.error("Error fetching profile:", err);
        res.status(500).send("Error loading user profile");
    }
});

// 5. Export the app so your index.js file can start the server
module.exports = app;