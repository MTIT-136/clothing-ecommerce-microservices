require("dotenv").config();

const mongoose = require("mongoose");
const createApp = require("./app");

const port = Number(process.env.PORT) || 3003;
const serviceName = process.env.SERVICE_NAME || "cart-service";
const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

async function start() {
  if (!mongoUri) {
    console.warn(
      `[${serviceName}] MONGO_URI/MONGODB_URI not set. Skipping MongoDB connection.`
    );
  } else {
    await mongoose.connect(mongoUri);
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

