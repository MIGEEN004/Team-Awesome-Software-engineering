// Import express.js
const express = require("express");

// Create express app
var app = express();

app.use(express.urlencoded({ extended: true })); 

// Import session and bcrypt
const session = require('express-session');
const bcrypt = require('bcrypt');

// ... (existing code like var app = express();)

// 1. Setup Body Parser to handle form submissions (POST requests)
app.use(express.urlencoded({ extended: true }));

// 2. Setup Session Middleware
app.use(session({
  secret: 'team-awesome-secret-key', // In production, use an environment variable!
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, // Set to true if using HTTPS
    maxAge: 1000 * 60 * 60 * 24 // Session expires in 24 hours
  }
}));

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


// POST Login - Process the credentials
app.post("/login", async function(req, res) {
    const { username, password } = req.body;

    try {
        // 1. Find the user in the database
        const sql = "SELECT * FROM Users WHERE username = ?";
        const results = await db.query(sql, [username]);

        if (results.length > 0) {
            const user = results[0];

            // 2. Compare the provided password with the hashed password in the DB
            // Note: For now, if your DB sample data has plain text 'hashed_pass_123', 
            // bcrypt.compare will fail until you register a user with a real hash.
            const match = await bcrypt.compare(password, user.password);

            if (match) {
                // 3. Authentication successful! Store user info in the session
                req.session.user_id = user.UserID;
                req.session.username = user.username;
                req.session.loggedIn = true;

                console.log(`User ${user.username} logged in successfully.`);
                res.redirect("/"); // Redirect to home page
            } else {
                // Password does not match
                res.render("login", { error: "Invalid username or password." });
            }
        } else {
            // User not found
            res.render("login", { error: "Invalid username or password." });
        }
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).send("A server error occurred.");
    }
});

// Middleware to make user data available to all PUG templates
app.use((req, res, next) => {
    // res.locals allows variables to be accessed in any .pug file
    res.locals.loggedIn = req.session.loggedIn || false;
    res.locals.username = req.session.username || null;
    res.locals.userId = req.session.user_id || null;
    next();
});


// --- ROUTES ---

// 1. Home Page
// 1. Home Page - Now fetches categories for the community tags
app.get("/", async function(req, res) {
    try {
        // Query the Category table based on your SQL schema
        const sql = "SELECT CategoryID as id, category_name as name FROM Category";
        const categories = await db.query(sql);
        
        // Pass the categories to the 'index' view
        res.render("index", { categories: categories });
    } catch (err) {
        console.error("Error fetching categories for home page:", err);
        // Fallback to an empty array so the page doesn't crash
        res.render("index", { categories: [] }); 
    }
});

// 2. All Listings Page
app.get("/all-listings", async function(req, res) {
    try {
        const games = await Game.getAllGames();
        res.render('all-listings', { data: games });
    } catch (err) {
        console.error("Error fetching listings:", err);
        res.status(500).send("Database Error.");
    }
});

// 3. Listing Detail Page
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

// 4. Category Results Page
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

app.get("/", async function(req, res) {
    try {
        const categories = await Category.getAllCategories();
        res.render("index", { categories: categories });
    } catch (err) {
        res.status(500).send("Error loading categories.");
    }
});

// 5. User Profile Page
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

// GET Login Page
app.get("/login", function(req, res) {
    res.render("login");
});

// GET Logout
app.get("/logout", function(req, res) {
    req.session.destroy((err) => {
        if (err) {
            return console.log(err);
        }
        res.redirect("/");
    });
});

// GET Register Page
app.get("/register", function(req, res) {
    res.render("register");
});

// POST Register - Create a new user
app.post("/register", async function(req, res) {
    const { username, email, password } = req.body;

    try {
        // 1. Hash the password before saving (Security Requirement)
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // 2. Insert into the Users table
        const sql = "INSERT INTO Users (username, email, password) VALUES (?, ?, ?)";
        await db.query(sql, [username, email, hashedPassword]);

        // 3. Success: Redirect to login so they can sign in
        res.redirect("/login");
    } catch (err) {
        console.error("Registration error:", err);
        // Handle duplicate username/email errors specifically if needed
        res.render("register", { error: "Username or email already exists." });
    }
});

// Rating routes 

app.post("/listing-single/:id/rate-game", async function(req, res) { 

    const gameId = req.params.id; 

    const { graphics, gameplay, difficulty, story } = req.body; 

 

    await db.query( 

        "INSERT INTO GameRating (GameID, UserID, graphics, gameplay, difficulty, story) VALUES (?, 1, ?, ?, ?, ?)", 

        [gameId, graphics, gameplay, difficulty, story] 

    ); 

 

    res.redirect(`/listing-single/${gameId}`); 

});

// Example logic structure for app/app.js
app.post('/send-message', async (req, res) => {
    const { receiverId, listingId, messageText } = req.body;
    const senderId = req.session.userId; // Ensure middleware handles session check

    if (!senderId) {
        return res.redirect('/login'); // Requirement: User login
    }

    try {
        const sql = "INSERT INTO messages (sender_id, receiver_id, listing_id, message_text) VALUES (?, ?, ?, ?)";
        await db.query(sql, [senderId, receiverId, listingId, messageText]);
        res.redirect(`/listing/${listingId}?success=true`);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error sending message");
    }
});


// CRITICAL: Export the app for index.js and tests to use.
// DO NOT ADD app.listen() HERE!
module.exports = app;