// backend/index.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// SQLite setup
const db = new sqlite3.Database('./donations.db', (err) => {
  if(err){
    console.error('Error opening database:',err.message);
  } else {
    db.run(`
      CREATE TABLE IF NOT EXISTS donations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        donorName TEXT,
        item TEXT,
        quantity INTEGER,
        status TEXT DEFAULT 'Pending'
      )
    `);
  }
});

// ✅ GET all donations
app.get('/api/donations', (req,res) => {
  db.all('SELECT * FROM donations', [], (err,rows) => {
    if(err){
      res.status(500).json({error:err.message});
      return;
    }
    res.json(rows);
  });
});

// ✅ POST new donation
app.post('/api/donations', (req,res) => {
  const {donorName,item,quantity,status} = req.body;
  db.run(
    'INSERT INTO donations (donorName,item,quantity,status) VALUES (?,?,?,?)',
    [donorName,item,quantity,status || 'Pending'],
    function(err){
      if(err){
        res.status(500).json({error:err.message});
        return;
      }
      res.json({id:this.lastID,donorName,item,quantity,status:status || 'Pending'});
    }
  );
});

// ✅ UPDATE donation status
app.put('/api/donations/:id', (req,res) => {
  const {id} = req.params;
  const {status} = req.body;
  db.run(
    'UPDATE donations SET status=? WHERE id=?',
    [status,id],
    function(err){
      if(err){
        res.status(500).json({error:err.message});
        return;
      }
      res.json({updated:true});
    }
  );
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
