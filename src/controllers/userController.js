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
      // Check if email already exists
      const pool = await connectToDatabase();
      const emailCheckResult = await pool.request()
         .input('email', sql.VarChar, email)
         .query('SELECT * FROM users WHERE email = @email');

      if (emailCheckResult.recordset.length > 0) {
         res.status(400).json({ message: "Email already exists" });
         return;
      }

      // Hash the password before saving it
      const hashedPassword = crypto.createHash('sha256').update(pwd).digest('hex');

      await pool.request()
         .input('username', sql.VarChar, username)
         .input('pwd', sql.VarChar, hashedPassword) // Save the hashed password
         .input('email', sql.VarChar, email)
         .query('INSERT INTO users (username, password, email) VALUES (@username, @pwd, @email)');
      
      res.json({ message: "Data added successfully" });
   } catch (error) {
      console.error("Add user error:", error);
      res.status(500).json({ message: error.message });
   }
};

exports.login = async (req, res) => {
   const { email, password } = req.body;

   try {
      if (!email || !password) {
         throw new Error("Email or password is missing in the request body");
      }

      // Hash het ingevoerde wachtwoord voordat je het vergelijkt
      const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

      const pool = await connectToDatabase();
      const result = await pool.request()
         .input('email', sql.VarChar, email)
         .input('password', sql.VarChar, hashedPassword)
         .query('SELECT * FROM users WHERE email = @email AND password = @password');

      if (result.recordset.length > 0) {
         // Gebruiker gevonden, authenticatie gelukt
         const user = result.recordset[0];
         const token = jwt.sign({ userId: user.user_id, username: user.username, email: user.email }, 'jwt_secret_key');
         res.json({ token });
      } else {
         // Gebruiker niet gevonden of wachtwoord onjuist
         res.status(401).json({ message: "Invalid email or password" });
      }
   } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: error.message });
   }
};
