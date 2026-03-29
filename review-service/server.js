require("dotenv").config();

const mongoose = require("mongoose");
const createApp = require("./app");

const port = Number(process.env.PORT) || 3006;
const serviceName = process.env.SERVICE_NAME || "review-service";
const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

async function start() {
  if (mongoUri) {
    try {
      await mongoose.connect(mongoUri);
      console.log(`[${serviceName}] MongoDB connected`);
    } catch (err) {
      console.warn(`[${serviceName}] MongoDB connection failed: ${err.message}. Continuing without database.`);
    }
  } else {
    console.warn(`[${serviceName}] MONGO_URI not set. Skipping MongoDB connection.`);
  }

  const app = createApp();
  app.listen(port, () => {
    console.log(`[${serviceName}] listening on ${port}`);
  });
}

start().catch((err) => {
  console.error(`[${serviceName}] failed to start`, err);
  process.exit(1);
});