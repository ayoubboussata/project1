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
      const pool = await connectToDatabase();
      await pool.request()
         .input('username', sql.VarChar, username)
         .input('pwd', sql.VarChar, pwd)
         .input('email', sql.VarChar, email)
         .query('INSERT INTO users (username, password, email) VALUES (@username, @pwd, @email)');
      res.json({ message: "Data added successfully" });
   } catch (error) {
      res.json({ message: error.message });
   }
};
