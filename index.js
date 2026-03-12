"use strict";

console.log("entrypoint");

// 1. Include the app.js file (which contains your Express routes)
const app = require("./app/app.js");

// 2. Define the port
const PORT = 3000;

// 3. Start the server
app.listen(PORT, () => {
    console.log(`Server is successfully running on port ${PORT}`);
    console.log(`Ready to start "Sharing, exchange and building community"!`);
});