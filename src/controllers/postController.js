const sql = require('mssql');
const connectToDatabase = require('../database/db');

exports.getPosts = async (req, res) => {
   try {
      const pool = await connectToDatabase();
      const result = await pool.request().query("SELECT post_id, user_id, content, created_at FROM post");
      res.json({ message: result.recordset });
   } catch (error) {
      res.json({ message: error.message });
   }
};

exports.addPost = async (req, res) => {
   const { username, comment_text, users_id } = req.body;
   const created_at = new Date().toISOString().slice(0, 19).replace('T', ' ');

   try {
      const pool = await connectToDatabase();
      await pool.request()
         .input('username', sql.VarChar, username)
         .input('comment_text', sql.Text, comment_text)
         .input('created_at', sql.DateTime, created_at)
         .input('users_id', sql.Int, users_id)
         .query('INSERT INTO post (username, comment_text, created_at, users_id) VALUES (@username, @comment_text, @created_at, @users_id)');
      res.json({ message: "Post added successfully" });
   } catch (error) {
      res.json({ message: error.message });
   }
};
