const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sql = require('mssql');
const connectToDatabase = require('../database/db');

exports.getInfo = async (req, res) => {
   try {
      const pool = await connectToDatabase();
      const result = await pool.request().query("SELECT * FROM users");
      res.json({ message: result.recordset });
   } catch (error) {
      res.json({ message: error.message });
   }
};

exports.addUser = async (req, res) => {
   const { username, pwd, email } = req.body;

   try {
      // Hash het wachtwoord voordat je het opslaat
      const hashedPassword = crypto.createHash('sha256').update(pwd).digest('hex');

      const pool = await connectToDatabase();
      await pool.request()
         .input('username', sql.VarChar, username)
         .input('pwd', sql.VarChar, hashedPassword) // Opslaan van het gehashte wachtwoord
         .input('email', sql.VarChar, email)
         .query('INSERT INTO users (username, password, email) VALUES (@username, @pwd, @email)');
      res.json({ message: "Data added successfully" });
   } catch (error) {
      console.error("Add user error:", error);
      res.status(500).json({ message: error.message });
   }
};

exports.login = async (req, res) => {
   const { username, password } = req.body;

   try {
      if (!username || !password) {
         throw new Error("Username or password is missing in the request body");
      }

      // Hash het ingevoerde wachtwoord voordat je het vergelijkt
      const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

      const pool = await connectToDatabase();
      const result = await pool.request()
         .input('username', sql.VarChar, username)
         .input('password', sql.VarChar, hashedPassword) // Vergelijking met het gehashte wachtwoord in de database
         .query('SELECT * FROM users WHERE username = @username AND password = @password');

      if (result.recordset.length > 0) {
         // Gebruiker gevonden, authenticatie gelukt
         const user = result.recordset[0];
         const token = jwt.sign({ userId: user.id, username: user.username, email: user.email }, 'jwt_secret_key');
         res.json({ token });
      } else {
         // Gebruiker niet gevonden of wachtwoord onjuist
         res.status(401).json({ message: "Invalid username or password" });
      }
   } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: error.message });
   }
};