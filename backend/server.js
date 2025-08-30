const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 5000;
const SECRET = 'supersecretkey'; // ⚠️ put this in env for production

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const db = new sqlite3.Database('./donations.db',(err)=>{
  if(err){
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
  }
});

// Create tables if not exist
db.serialize(()=>{
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE,
    password TEXT,
    role TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS donations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    donorName TEXT,
    item TEXT,
    quantity TEXT,
    address TEXT,
    pickupTime TEXT,
    notes TEXT,
    status TEXT DEFAULT 'Available'
  )`);
});

// ---------------- AUTH ROUTES ----------------

// 👉 Register user
app.post('/register',(req,res)=>{
  const {name,email,password,role} = req.body;
  if(!name || !email || !password || !role){
    return res.status(400).json({error:'All fields required'});
  }

  db.run(
    `INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)`,
    [name,email,password,role],
    function(err){
      if(err){
        return res.status(500).json({error: err.message});
      }
      const token = jwt.sign({id:this.lastID,email,role},SECRET,{expiresIn:'1h'});
      res.json({token,role});
    }
  );
});

// 👉 Login user
app.post('/login',(req,res)=>{
  const {email,password} = req.body;
  if(!email || !password){
    return res.status(400).json({error:'Email and password required'});
  }

  db.get(`SELECT * FROM users WHERE email=? AND password=?`,[email,password],(err,row)=>{
    if(err){
      return res.status(500).json({error: err.message});
    }
    if(!row){
      return res.status(401).json({error:'Invalid credentials'});
    }

    const token = jwt.sign({id:row.id,email:row.email,role:row.role},SECRET,{expiresIn:'1h'});
    res.json({token,role:row.role});
  });
});

// ---------------- DONATION ROUTES ----------------

// 👉 Add a donation
app.post('/donations',(req,res)=>{
  const {donorName,item,quantity,address,pickupTime,notes} = req.body;
  db.run(
    `INSERT INTO donations (donorName,item,quantity,address,pickupTime,notes) VALUES (?,?,?,?,?,?)`,
    [donorName || 'Anonymous',item,quantity,address,pickupTime,notes],
    function(err){
      if(err){
        return res.status(500).json({error: err.message});
      }
      res.json({id:this.lastID,donorName,item,quantity,address,pickupTime,notes,status:'Available'});
    }
  );
});

// 👉 Get all donations
app.get('/donations',(req,res)=>{
  db.all(`SELECT * FROM donations`,[],(err,rows)=>{
    if(err){
      return res.status(500).json({error: err.message});
    }
    res.json(rows);
  });
});

// 👉 Claim a donation
app.put('/donations/:id/claim',(req,res)=>{
  const {id} = req.params;
  db.run(`UPDATE donations SET status='Claimed' WHERE id=?`,[id],function(err){
    if(err){
      return res.status(500).json({error: err.message});
    }
    res.json({message:'Donation claimed successfully',id});
  });
});

// ---------------- START SERVER ----------------
app.listen(PORT,()=>{
  console.log(`Server running on http://localhost:${PORT}`);
});
