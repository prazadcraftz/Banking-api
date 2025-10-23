const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const SECRET_KEY = 'supersecretkey123';

const USER = { username: 'admin', password: '1234' };

let account = {
  name: 'Bunny',
  balance: 1000,
};

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
    req.user = user; 
    next();
  });
}

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username === USER.username && password === USER.password) {
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
    return res.json({ message: 'Login successful', token });
  } else {
    return res.status(401).json({ error: 'Invalid username or password' });
  }
});


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

const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Banking API running on http://localhost:${PORT}`));

