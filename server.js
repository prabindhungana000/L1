const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const os = require('os');

const app = express();
const PORT = 3000;

// Serve static files (dsa.html, CSS, JS)
app.use(express.static(__dirname));

// Path to store user data
const dataFile = path.join(__dirname, 'users.json');

// Load existing users or initialize
let users = {};
if (fs.existsSync(dataFile)) {
    users = JSON.parse(fs.readFileSync(dataFile));
}

// Save users to file
function saveUsers() {
    fs.writeFileSync(dataFile, JSON.stringify(users, null, 2));
}

// Serve dsa.html at root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'dsa.html'));
});

// Signup route
app.post('/signup', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Missing username or password' });
    if (users[username]) return res.status(400).json({ error: 'Username already exists' });

    users[username] = { password, lists: [] };
    saveUsers();
    res.json({ success: true });
});

// Login route
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (!users[username]) return res.status(400).json({ error: 'Username not found' });
    if (users[username].password !== password) return res.status(400).json({ error: 'Incorrect password' });

    res.json({ success: true, lists: users[username].lists });
});

// Save/update todo lists
app.post('/saveLists', (req, res) => {
    const { username, lists } = req.body;
    if (!users[username]) return res.status(400).json({ error: 'User not found' });

    users[username].lists = lists || [];
    saveUsers();
    res.json({ success: true });
});

// Start server accessible on LAN
app.listen(PORT, '0.0.0.0', () => {
    let localIp = 'localhost';
    const nets = os.networkInterfaces();
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                localIp = net.address;
                break;
            }
        }
    }
    console.log(`Server running on LAN: http://${localIp}:${PORT}/`);
    console.log(`You can also run 'ngrok http ${PORT}' to get a public URL`);
});