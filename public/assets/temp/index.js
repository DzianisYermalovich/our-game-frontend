const express = require('express');
const app = express();
const port = 80; // Application port

// It handles all requests
app.get('*', function (req, res) {
    // If it static file
    if (req.url.search(/\.\w{1,5}$/) !== -1) {
        // Return static file
        res.sendFile(__dirname + '/our-game-frontend' + req.url);
    } else {
        // Return index.html
        res.sendFile(__dirname + '/our-game-frontend/index.html');
    };
});

// It launches application. Command: node index.js
app.listen(port, () => {
    console.log(`server started. Check http://localhost:${port}`);
});