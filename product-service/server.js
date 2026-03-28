require("dotenv").config();

const createApp = require("./app");
const connectDB = require("./config/db");

const port = Number(process.env.PORT) || 3002;
const serviceName = "product-service";

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
