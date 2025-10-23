const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Secret key for signing JWT (in real projects, store in .env)
const SECRET_KEY = 'supersecretkey123';

// Hardcoded user (for demo)
const USER = { username: 'admin', password: '1234' };

// Simulated user account
let account = {
  name: 'John Doe',
  balance: 1000,
};

// --- Middleware to verify JWT ---
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extract Bearer token

  if (!token) {
    return res.status(401).json({ error: 'Access Denied: Token missing' });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user; // attach decoded user info to request
    next();
  });
}

// --- Login Route ---
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username === USER.username && password === USER.password) {
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
    return res.json({ message: 'Login successful', token });
  } else {
    return res.status(401).json({ error: 'Invalid username or password' });
  }
});

// --- Protected Banking Routes ---

// 1. View Balance
app.get('/balance', authenticateToken, (req, res) => {
  res.json({ accountHolder: account.name, balance: account.balance });
});

// 2. Deposit Money
app.post('/deposit', authenticateToken, (req, res) => {
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Invalid deposit amount' });
  }

  account.balance += amount;
  res.json({ message: `Deposited ₹${amount}`, newBalance: account.balance });
});

// 3. Withdraw Money
app.post('/withdraw', authenticateToken, (req, res) => {
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Invalid withdrawal amount' });
  }

  if (account.balance < amount) {
    return res.status(400).json({ error: 'Insufficient balance' });
  }

  account.balance -= amount;
  res.json({ message: `Withdrew ₹${amount}`, newBalance: account.balance });
});

// --- Start Server ---
const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Banking API running on http://localhost:${PORT}`));
