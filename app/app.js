const express = require('express');
const path = require('path');
const app = express();
// Import the database connection from the services folder
const db = require('./services/db');

// Set the view engine to Pug
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, '../views'));

// Serve static files from the 'static' directory
app.use(express.static(path.join(__dirname, '../static')));

// --- MIDDLEWARE ---
// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: true }));
// Parse JSON bodies (as sent by API clients/fetch)
app.use(express.json());

// Mock Authentication Middleware
app.use((req, res, next) => {
    // req.user = { 
    //     id: 1, 
    //     nickname: 'alice',
    //     full_name: 'Alice Smith'
    // };
    // res.locals.currentUser = req.user; 
    next();
});

// --- ROUTES ---

// 1. Home Page - List all games
app.get('/', async (req, res) => {
    try {
        const sql = 'SELECT * FROM games';
        const [rows] = await db.query(sql);
        res.render('index', { games: rows });
    } catch (err) {
        console.error("Home page error:", err);
        res.status(500).send('Error loading home page');
    }
});

// 2. Game Detail Page - Fetch specific game with Tags and Platforms
app.get('/game/:id', async (req, res) => {
    const gameId = req.params.id;

    // This query joins games with their tags and platforms via junction tables
    const sql = `
        SELECT 
            g.*, 
            GROUP_CONCAT(DISTINCT t.name SEPARATOR ', ') AS tags,
            GROUP_CONCAT(DISTINCT p.name SEPARATOR ', ') AS platforms
        FROM games g
        LEFT JOIN game_tags gt ON g.id = gt.game_id
        LEFT JOIN tags t ON gt.tag_id = t.id
        LEFT JOIN game_platforms gp ON g.id = gp.game_id
        LEFT JOIN platforms p ON gp.platform_id = p.id
        WHERE g.id = ?
        GROUP BY g.id`;

    try {
        const [results] = await db.query(sql, [gameId]);
        
        if (results.length > 0) {
            // Render the 'game-detail.pug' view with the game data
            res.render('game-detail', { game: results[0] });
        } else {
            res.status(404).send('Game not found');
        }
    } catch (err) {
        console.error("Database query error:", err);
        res.status(500).send('Internal Server Error');
    }
});

// 3. Category Page - Existing project view
app.get('/categories', (req, res) => {
    res.render('categories');
});


// --- INTERACTIVE POST ROUTES ---

// 1. Submit a Comment
app.post('/post/:id/comment', async (req, res) => {
    const postId = req.params.id;
    const userId = req.user.id; // Comes from our mock middleware
    const { comment_text } = req.body; // Comes from the form input

    try {
        await db.query(
            'INSERT INTO comments (post_id, user_id, comment_text) VALUES (?, ?, ?)', 
            [postId, userId, comment_text]
        );
        // Refresh the page to show the new comment
        res.redirect(`/post/${postId}`); 
    } catch (error) {
        console.error("Error posting comment:", error);
        res.status(500).send("Error posting comment");
    }
});

// 2. Submit a Reply
app.post('/comment/:commentId/reply', async (req, res) => {
    const commentId = req.params.commentId;
    const userId = req.user.id;
    const { reply_text, postId } = req.body; // We need postId from a hidden input to know where to redirect

    try {
        await db.query(
            'INSERT INTO replies (comment_id, user_id, reply_text) VALUES (?, ?, ?)', 
            [commentId, userId, reply_text]
        );
        res.redirect(`/post/${postId}`);
    } catch (error) {
        console.error("Error posting reply:", error);
        res.status(500).send("Error posting reply");
    }
});

// 3. Submit a Rating
app.post('/post/:id/rate', async (req, res) => {
    const postId = req.params.id;
    const userId = req.user.id;
    const { rating_value } = req.body; 

    try {
        // Step A: Insert or Update the user's specific rating
        // The ON DUPLICATE KEY UPDATE ensures a user can only rate once, but can change their mind[cite: 3]
        await db.query(`
            INSERT INTO post_ratings (post_id, user_id, rating_value) 
            VALUES (?, ?, ?) 
            ON DUPLICATE KEY UPDATE rating_value = ?`, 
            [postId, userId, rating_value, rating_value]
        );

        // Step B: Calculate the new average and update the main posts table
        await db.query(`
            UPDATE posts 
            SET total_rating = (SELECT IFNULL(AVG(rating_value), 0) FROM post_ratings WHERE post_id = ?) 
            WHERE id = ?`, 
            [postId, postId]
        );

        res.redirect(`/post/${postId}`);
    } catch (error) {
        console.error("Error rating post:", error);
        res.status(500).send("Error rating post");
    }
});

// Export the app object so it can be used by index.js[cite: 1]
module.exports = app;