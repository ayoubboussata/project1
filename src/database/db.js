const sql = require('mssql');
require('dotenv').config();

const config = {
   user: process.env.DB_USER,
   password: process.env.DB_PASSWORD,
   server: process.env.DB_HOST,
   database: process.env.DB_NAME,
   options: {
      encrypt: true, 
      trustServerCertificate: false 
   }
};

const connectToDatabase = async () => {
   try {
      let pool = await sql.connect(config);
      console.log("Db connection!");
      return pool;
   } catch (error) {
      console.error("Error connecting to SQL Server:", error);
      throw error;
   }
};

module.exports = connectToDatabase;
