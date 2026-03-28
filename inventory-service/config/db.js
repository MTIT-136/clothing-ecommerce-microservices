const mongoose = require("mongoose");

const LOG_PREFIX = "[Inventory Service][MongoDB]";

async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri || typeof uri !== "string" || uri.trim() === "") {
    const err = new Error("MONGO_URI is missing or empty");
    console.error(`${LOG_PREFIX} ${err.message}`);
    throw err;
  }

  try {
    console.log(`${LOG_PREFIX} Connecting...`);
    await mongoose.connect(uri);
    console.log(`${LOG_PREFIX} Connected successfully`);
  } catch (err) {
    console.error(`${LOG_PREFIX} Connection failed:`, err.message);
    if (err.stack) {
      console.error(err.stack);
    }
    throw err;
  }
}

module.exports = connectDB;
