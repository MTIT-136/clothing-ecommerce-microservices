require("dotenv").config();

const mongoose = require("mongoose");
const createApp = require("./app");

const port = Number(process.env.PORT) || 3002;
const serviceName = process.env.SERVICE_NAME || "product-service";

async function start() {
  if (!process.env.MONGODB_URI) {
    console.warn(`[${serviceName}] MONGODB_URI not set. Skipping MongoDB connection.`);
  } else {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(`[${serviceName}] MongoDB connected`);
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

