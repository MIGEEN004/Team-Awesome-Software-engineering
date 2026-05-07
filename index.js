const express = require('express');
const path = require('path');
const app = express(); 
const db = require('./app/services/db'); //
const session = require('express-session');
const bcrypt = require('bcrypt');


// Setup View Engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Setup Static Files (for CSS and Images)
app.use(express.static(path.join(__dirname, 'static')));

// --- MIDDLEWARE ---
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 1. Configure the Session
app.use(session({
    secret: 'gamespace_super_secret_key', // In production, keep this in a .env file!
    resave: false,
    saveUninitialized: false
}));

// 2. Real Authentication Middleware
app.use(async (req, res, next) => {
    // Check if the user's browser has an active session ID
    if (req.session.userId) {
        try {
            // Fetch the logged-in user from the database[cite: 3]
            const [userResult] = await db.query('SELECT * FROM users WHERE id = ?', [req.session.userId]);
            
            if (userResult.length > 0) {
                req.user = userResult[0]; // Attach to request for backend routes
                res.locals.currentUser = req.user; // Attach to locals for Pug templates
            }
        } catch (error) {
            console.error("Session verification error:", error);
        }
    }
    next();
});

// --- ROUTES ---

// 1. Home Page
// Replace your existing 1. Home Page route in index.js with this:
app.get('/', async (req, res) => {
  // Existing query for top games
  const gamesSql = `
    SELECT 
      g.id, g.title, g.description, g.release_year, g.metacritic_score,
      GROUP_CONCAT(DISTINCT t.name SEPARATOR ', ') AS tags,
      GROUP_CONCAT(DISTINCT p.name SEPARATOR ', ') AS platforms
    FROM games g
    LEFT JOIN game_tags gt ON g.id = gt.game_id
    LEFT JOIN tags t ON gt.tag_id = t.id
    LEFT JOIN game_platforms gp ON g.id = gp.game_id
    LEFT JOIN platforms p ON gp.platform_id = p.id
    GROUP BY g.id
    ORDER BY g.metacritic_score DESC
    LIMIT 10`;

  // Query for Top 3 Trending Posts in the last 24 hours
  const trendingPostsSql = `
    SELECT p.id, p.title, p.total_rating, u.nickname AS username
    FROM posts p
    JOIN users u ON p.user_id = u.id
    WHERE p.post_timestamp >= NOW() - INTERVAL 1 DAY
    ORDER BY p.total_rating DESC
    LIMIT 3
  `;

  // Query for Top 10 Most Rated Posts of all time
  const topPostsSql = `
    SELECT p.id, p.title, p.total_rating, u.nickname AS username
    FROM posts p
    JOIN users u ON p.user_id = u.id
    ORDER BY p.total_rating DESC
    LIMIT 10
  `;

  try {
    // Execute all queries concurrently for better performance
    const [
      [topGames],
      [trendingPosts],
      [topPosts]
    ] = await Promise.all([
      db.query(gamesSql),
      db.query(trendingPostsSql),
      db.query(topPostsSql)
    ]);

    // Pass all three datasets to the index template
    res.render('index', { 
      topGames, 
      trendingPosts, 
      topPosts 
    });
  } catch (err) {
    console.error("Home page error:", err);
    res.status(500).send("Database Error");
  }
});

// 2. Categories Page
app.get('/categories', async (req, res) => {
  try {
    const [tags] = await db.query('SELECT * FROM tags');
    const [platforms] = await db.query('SELECT * FROM platforms');
    
    res.render('categories', { tags, platforms });
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).send("Database Error");
  }
});

// 2. Updated Detail Route
app.get('/game/:id', async (req, res) => {
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
    const [results] = await db.query(sql, [req.params.id]);
    if (results.length > 0) {
      res.render('game-detail', { game: results[0] });
    } else {
      res.status(404).send('Game not found');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

// 1. Updated Listing Route
app.get('/games', async (req, res) => {
  const sql = `
    SELECT 
      g.id, g.title, g.description, g.release_year, g.metacritic_score,
      GROUP_CONCAT(DISTINCT t.name SEPARATOR ', ') AS tags,
      GROUP_CONCAT(DISTINCT p.name SEPARATOR ', ') AS platforms
    FROM games g
    LEFT JOIN game_tags gt ON g.id = gt.game_id
    LEFT JOIN tags t ON gt.tag_id = t.id
    LEFT JOIN game_platforms gp ON g.id = gp.game_id
    LEFT JOIN platforms p ON gp.platform_id = p.id
    GROUP BY g.id`;

  try {
    const [rows] = await db.query(sql);
    res.render('games', { games: rows });
  } catch (err) {
    console.error(err);
    res.status(500).send("Database Error");
  }
});

// Add this route to your app.js or router
app.get('/user/:id', async (req, res) => {
    const userId = req.params.id;

    try {
        // 1. Fetch User Data
        const [userResult] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
        
        if (userResult.length === 0) {
            return res.status(404).send('User not found');
        }
        const user = userResult[0];

        // 2. Fetch User Posts (Joining with flairs to get the flair name)
        const postQuery = `
            SELECT p.*, f.Flair_Name 
            FROM posts p 
            LEFT JOIN flairs f ON p.flair_id = f.id 
            WHERE p.user_id = ? 
            ORDER BY p.post_timestamp DESC
        `;
        const [posts] = await db.query(postQuery, [userId]);

        // 3. Render the Pug template
        res.render('profile', { 
            title: `${user.full_name}'s Profile`, 
            user: user, 
            posts: posts 
        });

    } catch (error) {
        console.error("Database error:", error);
        res.status(500).send("Internal Server Error");
    }
});

// --- WRITE POST ROUTES ---

// 1. GET: Show the "Create Post" form
app.get('/create-post', async (req, res) => {
    try {
        // We need to fetch flairs, games, and platforms to populate the dropdown menus
        const [flairs] = await db.query('SELECT * FROM flairs');
        const [games] = await db.query('SELECT id, title FROM games ORDER BY title ASC');
        const [platforms] = await db.query('SELECT id, name FROM platforms ORDER BY name ASC');

        res.render('create-post', { 
            title: 'Write a New Post',
            flairs: flairs,
            games: games,
            platforms: platforms
        });
    } catch (error) {
        console.error("Error loading create post page:", error);
        res.status(500).send("Internal Server Error");
    }
});

// 2. POST: Handle the form submission and save to the database
app.post('/create-post', async (req, res) => {
    const userId = req.user.id; // Grabbing Alice's dummy ID
    const { title, description, flair_id, game, platform } = req.body;

    try {
        // Insert the new post into the database
        const [result] = await db.query(
            `INSERT INTO posts (user_id, title, description, flair_id, game, platform) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                userId, 
                title, 
                description, 
                flair_id || null, // Fallbacks in case the user leaves a dropdown empty
                game || null, 
                platform || null
            ]
        );

        // result.insertId gives us the ID of the newly created post
        const newPostId = result.insertId; 
        
        // Redirect the user straight to their brand new post!
        res.redirect(`/post/${newPostId}`);
    } catch (error) {
        console.error("Error creating post:", error);
        res.status(500).send("Error creating post");
    }
});

app.get('/post/:id', async (req, res) => {
    const postId = req.params.id;

    try {
        // 1. Fetch Post Data[cite: 4]
        const postQuery = `
        SELECT 
            p.*, 
            u.nickname, 
            f.Flair_Name, 
            g.title AS game_name, 
            pl.name AS platform_name
        FROM posts p
        JOIN users u ON p.user_id = u.id
        LEFT JOIN flairs f ON p.flair_id = f.id
        LEFT JOIN games g ON p.game = g.id
        LEFT JOIN platforms pl ON p.platform = pl.id
        WHERE p.id = ?
        `;
        const [postResult] = await db.query(postQuery, [postId]);
        if (postResult.length === 0) return res.status(404).send('Post not found');
        const post = postResult[0];

        // 2. Fetch Comments[cite: 4]
        const commentsQuery = `
            SELECT c.*, u.nickname 
            FROM comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.post_id = ?
            ORDER BY c.comment_timestamp ASC
        `;
        const [comments] = await db.query(commentsQuery, [postId]);

        // 3. Fetch Replies for all comments on this post[cite: 3]
        const repliesQuery = `
            SELECT r.*, u.nickname 
            FROM replies r
            JOIN users u ON r.user_id = u.id
            JOIN comments c ON r.comment_id = c.id
            WHERE c.post_id = ?
            ORDER BY r.reply_timestamp ASC
        `;
        const [replies] = await db.query(repliesQuery, [postId]);

        // 4. Render template with posts, comments, and replies
        res.render('post', { 
            title: post.title, 
            post: post, 
            comments: comments,
            replies: replies 
        });

    } catch (error) {
        console.error("Database error:", error);
        res.status(500).send("Internal Server Error");
    }
});

// Replace the dummy app.get('/posts', ...) with this:
// Updated Route in index.js
app.get('/posts', async (req, res) => {
    try {
        const query = `
            SELECT 
                p.id,
                p.title,
                u.nickname AS username,
                DATE_FORMAT(p.post_timestamp, '%Y-%m-%d') AS date,
                f.Flair_Name AS flair,
                g.title AS game_name,
                pl.name AS platform_name
            FROM posts p
            JOIN users u ON p.user_id = u.id
            LEFT JOIN flairs f ON p.flair_id = f.id
            LEFT JOIN games g ON p.game = g.id
            LEFT JOIN platforms pl ON p.platform = pl.id
            ORDER BY p.post_timestamp DESC;
        `;
        
        const [posts] = await db.query(query);

        res.render('posts', { 
            title: 'Post List', 
            posts: posts 
        });
    } catch (error) {
        console.error("Error fetching posts:", error);
        res.status(500).send("Internal Server Error");
    }
});


// Route to show games filtered by a specific tag
app.get('/tags/:id', async (req, res) => {
  const tagId = req.params.id;
  const sql = `
    SELECT 
      g.id, g.title, g.description, g.release_year, g.metacritic_score,
      GROUP_CONCAT(DISTINCT t.name SEPARATOR ', ') AS tags,
      GROUP_CONCAT(DISTINCT p.name SEPARATOR ', ') AS platforms
    FROM games g
    JOIN game_tags gt_filter ON g.id = gt_filter.game_id
    LEFT JOIN game_tags gt ON g.id = gt.game_id
    LEFT JOIN tags t ON gt.tag_id = t.id
    LEFT JOIN game_platforms gp ON g.id = gp.game_id
    LEFT JOIN platforms p ON gp.platform_id = p.id
    WHERE gt_filter.tag_id = ?
    GROUP BY g.id`;

  try {
    const [rows] = await db.query(sql, [tagId]);
    res.render('games', { games: rows, title: `Games with Tag #${tagId}` });
  } catch (err) {
    console.error(err);
    res.status(500).send("Database Error");
  }
});

// Route to show games filtered by a specific platform
app.get('/platform/:id', async (req, res) => {
  const platformId = req.params.id;
  const sql = `
    SELECT 
      g.id, g.title, g.description, g.release_year, g.metacritic_score,
      GROUP_CONCAT(DISTINCT t.name SEPARATOR ', ') AS tags,
      GROUP_CONCAT(DISTINCT p.name SEPARATOR ', ') AS platforms
    FROM games g
    JOIN game_platforms gp_filter ON g.id = gp_filter.game_id
    LEFT JOIN game_tags gt ON g.id = gt.game_id
    LEFT JOIN tags t ON gt.tag_id = t.id
    LEFT JOIN game_platforms gp ON g.id = gp.game_id
    LEFT JOIN platforms p ON gp.platform_id = p.id
    WHERE gp_filter.platform_id = ?
    GROUP BY g.id`;

  try {
    const [rows] = await db.query(sql, [platformId]);
    res.render('games', { games: rows, title: `Games on Platform #${platformId}` });
  } catch (err) {
    console.error(err);
    res.status(500).send("Database Error");
  }
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

// Updated Star/Rating Route in index.js
app.post('/post/:id/rate', async (req, res) => {
    const postId = req.params.id;
    const userId = req.user.id;

    try {
        // 1. Check if the user has already starred this post
        const [existing] = await db.query(
            'SELECT * FROM post_ratings WHERE post_id = ? AND user_id = ?',
            [postId, userId]
        );

        if (existing.length > 0) {
            // 2a. If they already starred it, remove the star (Toggle off)
            await db.query(
                'DELETE FROM post_ratings WHERE post_id = ? AND user_id = ?',
                [postId, userId]
            );
        } else {
            // 2b. If they haven't starred it, add a star (Toggle on)
            // We use '1' as a placeholder value since we are just counting rows
            await db.query(
                'INSERT INTO post_ratings (post_id, user_id, rating_value) VALUES (?, ?, 1)',
                [postId, userId]
            );
        }

        // 3. Recalculate the TOTAL COUNT of stars and update the posts table
        await db.query(`
            UPDATE posts 
            SET total_rating = (SELECT COUNT(*) FROM post_ratings WHERE post_id = ?) 
            WHERE id = ?`, 
            [postId, postId]
        );

        res.redirect(`/post/${postId}`);
    } catch (error) {
        console.error("Error starring post:", error);
        res.status(500).send("Error starring post");
    }
});

// --- ACTUAL AUTHENTICATION LOGIC ---

// Show Login Page
app.get('/login', (req, res) => {
    res.render('login', { title: 'Login - Gamespace' });
});

// Show Registration Page
app.get('/register', (req, res) => {
    res.render('register', { title: 'Register - Gamespace' });
});

// Handle Registration
app.post('/register', async (req, res) => {
    const { full_name, nickname, email, password } = req.body;

    try {
        // 1. Hash the password (10 is the "salt rounds", a good default for security)
        const hashedPassword = await bcrypt.hash(password, 10);

        // 2. Insert into the database
        await db.query(
            'INSERT INTO users (full_name, nickname, email, password) VALUES (?, ?, ?, ?)',
            [full_name, nickname, email, hashedPassword]
        );

        // 3. Redirect to login page after successful registration
        res.redirect('/login');
    } catch (error) {
        console.error("Registration error:", error);
        // A simple fallback if they try to use an email/nickname that already exists
        res.status(400).send(`
            <h2>Registration Failed</h2>
            <p>That email or nickname might already be taken.</p>
            <a href="/register">Try again</a>
        `);
    }
});

// Handle Login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Find the user by email
        const [userResult] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        
        if (userResult.length === 0) {
            return res.status(401).send('<h2>Login Failed</h2><p>Invalid email or password.</p><a href="/login">Try again</a>');
        }

        const user = userResult[0];

        // 2. Compare the entered password with the hashed password in the database
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (passwordMatch) {
            // 3. Success! Save the user's ID into their session
            req.session.userId = user.id;
            res.redirect('/'); // Send them to the homepage
        } else {
            res.status(401).send('<h2>Login Failed</h2><p>Invalid email or password.</p><a href="/login">Try again</a>');
        }
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).send("Internal Server Error");
    }
});

// Handle Logout
app.get('/logout', (req, res) => {
    // Destroy the session to log the user out
    req.session.destroy((err) => {
        if (err) console.error("Error destroying session:", err);
        res.redirect('/'); // Send them back to the homepage
    });
});


// --- MESSAGING ROUTES ---

// 1. GET: Show the Inbox (Recent messages received)
app.get('/inbox', async (req, res) => {
    if (!req.user) return res.redirect('/login');

    try {
        // Fetch all messages where the current user is the receiver
        const inboxQuery = `
            SELECT m.*, u.nickname AS sender_name 
            FROM messages m
            JOIN users u ON m.sender_id = u.id
            WHERE m.receiver_id = ?
            ORDER BY m.sent_at DESC
        `;
        const [messages] = await db.query(inboxQuery, [req.user.id]);
        
        res.render('inbox', { title: 'Your Inbox', messages });
    } catch (error) {
        console.error("Inbox error:", error);
        res.status(500).send("Internal Server Error");
    }
});

// 2. GET: Show a specific conversation with another user
app.get('/messages/:otherUserId', async (req, res) => {
    if (!req.user) return res.redirect('/login');
    
    const otherUserId = req.params.otherUserId;
    const currentUserId = req.user.id;

    // Don't let users message themselves
    if (otherUserId == currentUserId) return res.redirect('/inbox');

    try {
        // Get the other user's nickname for the header
        const [userResult] = await db.query('SELECT nickname FROM users WHERE id = ?', [otherUserId]);
        if (userResult.length === 0) return res.status(404).send('User not found');
        const otherUser = userResult[0];

        // Fetch the back-and-forth chat history between these two users
        const chatQuery = `
            SELECT m.*, u.nickname AS sender_name 
            FROM messages m
            JOIN users u ON m.sender_id = u.id
            WHERE (m.sender_id = ? AND m.receiver_id = ?) 
               OR (m.sender_id = ? AND m.receiver_id = ?)
            ORDER BY m.sent_at ASC
        `;
        const [chat] = await db.query(chatQuery, [currentUserId, otherUserId, otherUserId, currentUserId]);

        // Mark unread messages from this user as read
        await db.query(
            'UPDATE messages SET is_read = TRUE WHERE sender_id = ? AND receiver_id = ? AND is_read = FALSE', 
            [otherUserId, currentUserId]
        );

        res.render('conversation', { 
            title: `Chat with ${otherUser.nickname}`, 
            chat, 
            otherUser, 
            otherUserId 
        });
    } catch (error) {
        console.error("Conversation error:", error);
        res.status(500).send("Internal Server Error");
    }
});

// 3. POST: Send a message
app.post('/messages/:otherUserId', async (req, res) => {
    if (!req.user) return res.status(401).send("Unauthorized");
    
    const receiverId = req.params.otherUserId;
    const senderId = req.user.id;
    const { message_text } = req.body;

    try {
        await db.query(
            'INSERT INTO messages (sender_id, receiver_id, message_text) VALUES (?, ?, ?)', 
            [senderId, receiverId, message_text]
        );
        // Refresh the conversation page so the new message appears
        res.redirect(`/messages/${receiverId}`);
    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).send("Error sending message");
    }
});

// --- SEARCH ROUTE ---
app.get('/search', async (req, res) => {
    const query = req.query.q;

    if (!query) {
        return res.redirect('/');
    }

    // SQL for searching games
    const gamesSql = `
        SELECT g.*, 
               GROUP_CONCAT(DISTINCT t.name SEPARATOR ', ') AS tags,
               GROUP_CONCAT(DISTINCT p.name SEPARATOR ', ') AS platforms
        FROM games g
        LEFT JOIN game_tags gt ON g.id = gt.game_id
        LEFT JOIN tags t ON gt.tag_id = t.id
        LEFT JOIN game_platforms gp ON g.id = gp.game_id
        LEFT JOIN platforms p ON gp.platform_id = p.id
        WHERE g.title LIKE ? OR g.description LIKE ?
        GROUP BY g.id`;

    // SQL for searching posts
    const postsSql = `
        SELECT p.*, u.nickname AS username, f.Flair_Name AS flair
        FROM posts p
        JOIN users u ON p.user_id = u.id
        LEFT JOIN flairs f ON p.flair_id = f.id
        WHERE p.title LIKE ? OR p.description LIKE ?
        ORDER BY p.post_timestamp DESC`;

    const searchParam = `%${query}%`;

    try {
        const [[gameResults], [postResults]] = await Promise.all([
            db.query(gamesSql, [searchParam, searchParam]),
            db.query(postsSql, [searchParam, searchParam])
        ]);

        res.render('search-results', { 
            title: `Search Results for "${query}"`,
            query,
            gameResults,
            postResults
        });
    } catch (error) {
        console.error("Search error:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.post('/profile/edit', async (req, res) => {
    if (!req.user) return res.redirect('/login');
    const { bio } = req.body;
    try {
        await db.query('UPDATE users SET bio = ? WHERE id = ?', [bio, req.user.id]);
        res.redirect(`/user/${req.user.id}`);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error updating bio");
    }
});

// Show Edit Form
app.get('/post/:id/edit', async (req, res) => {
    const [result] = await db.query('SELECT * FROM posts WHERE id = ?', [req.params.id]);
    if (result.length === 0 || result[0].user_id !== req.user.id) return res.redirect('/');
    
    const [flairs] = await db.query('SELECT * FROM flairs');
    res.render('create-post', { title: 'Edit Post', post: result[0], flairs, isEditing: true });
});

// Handle Update
app.post('/post/:id/edit', async (req, res) => {
    const { title, description, flair_id } = req.body;
    await db.query(
        'UPDATE posts SET title = ?, description = ?, flair_id = ? WHERE id = ? AND user_id = ?',
        [title, description, flair_id, req.params.id, req.user.id]
    );
    res.redirect(`/post/${req.params.id}`);
});

// Handle Delete
app.post('/post/:id/delete', async (req, res) => {
    await db.query('DELETE FROM posts WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.redirect('/posts');
});


// Edit Comment
app.post('/comment/:id/edit', async (req, res) => {
    const { comment_text, postId } = req.body;
    await db.query('UPDATE comments SET comment_text = ? WHERE id = ? AND user_id = ?', 
        [comment_text, req.params.id, req.user.id]);
    res.redirect(`/post/${postId}`);
});

// Delete Comment
app.post('/comment/:id/delete', async (req, res) => {
    const { postId } = req.body;
    await db.query('DELETE FROM comments WHERE id = ? AND user_id = ?', 
        [req.params.id, req.user.id]);
    res.redirect(`/post/${postId}`);
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log(`Test Game Link: http://localhost:${PORT}/game/1`);
});


module.exports = app;