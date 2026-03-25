const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const sampleRoutes = require("./routes/sampleRoutes");

function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(morgan("dev"));

  app.use("/", sampleRoutes);

  return app;
}

module.exports = createApp;

