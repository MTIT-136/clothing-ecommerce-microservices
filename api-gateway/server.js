require("dotenv").config();

const createApp = require("./app");

const port = Number(process.env.PORT) || 8000;
const serviceName = process.env.SERVICE_NAME || "api-gateway";

const app = createApp();

app.listen(port, () => {
  console.log(`[${serviceName}] listening on ${port}`);
});

