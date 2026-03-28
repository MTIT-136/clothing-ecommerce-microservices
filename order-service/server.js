require("dotenv").config();

const createApp = require("./app");
const { connectDB } = require("./src/config/db");

const port = Number(process.env.PORT) || 3004;
const serviceName = process.env.SERVICE_NAME || "order-service";

async function start() {
  await connectDB();

  const app = createApp();
  app.listen(port, () => {
    console.log(`[${serviceName}] listening on ${port}`);
  });
}

start().catch((err) => {
  console.error(`[${serviceName}] failed to start`, err);
  process.exit(1);
});
