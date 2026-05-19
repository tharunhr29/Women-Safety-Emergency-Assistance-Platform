const mongoose = require("mongoose");
const dotenv = require("dotenv");
const dns = require("dns");

// Set DNS servers to Google's public DNS to resolve SRV records
dns.setServers(["8.8.8.8", "8.8.4.4"]);

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // Fast timeout for cloud
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Cloud Connection Blocked: ${error.message}`);
    console.log(`--------------------------------------------------`);
    console.log(`Your Wi-Fi is permanently blocking Cloud Databases.`);
    console.log(`Starting Local Offline Database as a fallback...`);
    console.log(`--------------------------------------------------`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const uri = mongoServer.getUri();
      const conn = await mongoose.connect(uri);
      console.log(`SUCCESS! Local Database Connected: ${conn.connection.host}`);
    } catch (memError) {
      console.error(`Please install the offline database package by running:`);
      console.error(`npm install mongodb-memory-server`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
