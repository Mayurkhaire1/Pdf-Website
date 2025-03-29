const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const path = require('path');
const basicAuth = require('express-basic-auth');

const app = express();
const port = 3000;

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Set up SQLite database
const db = new sqlite3.Database('./pdfs.db', (err) => {
  if (err) {
    console.error('Error opening database', err);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Create table for PDFs if it doesn’t exist
db.run(`CREATE TABLE IF NOT EXISTS pdfs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  price REAL,
  filePath TEXT
)`);

// Configure file upload storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/pdfs/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Protect upload endpoint with basic authentication
app.use('/api/upload', basicAuth({
  users: { 'owner': 'jhon123' }, // Replace with your own password
  challenge: true
}));

// API to list all PDFs
app.get('/api/pdfs', (req, res) => {
  db.all('SELECT * FROM pdfs', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// API to upload a PDF (owner-only)
app.post('/api/upload', upload.single('pdfFile'), (req, res) => {
  const { name, price } = req.body;
  const filePath = `/pdfs/${req.file.filename}`;
  db.run('INSERT INTO pdfs (name, price, filePath) VALUES (?, ?, ?)', [name, price, filePath], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, name, price, filePath });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});