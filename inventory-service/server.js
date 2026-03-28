require("dotenv").config();

const connectDB = require("./config/db");
const app = require("./app");

const PORT = Number(process.env.PORT) || 3004;

async function start() {
  try {
    await connectDB();
  } catch (err) {
    console.error(
      "[Inventory Service] Cannot start: database connection failed."
    );
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`Inventory Service running on port ${PORT}`);
  });
}

start();
