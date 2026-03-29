require('dotenv').config();

const createApp = require('./app');
const { connectDB } = require('./src/config/db');

const PORT = Number(process.env.PORT) || 3001;
const serviceName = process.env.SERVICE_NAME || 'user-service';

async function start() {
  try {
    await connectDB();

    const app = createApp();
    app.listen(PORT, () => {
      const baseUrl = `http://localhost:${PORT}`;
      console.log(`[${serviceName}] listening on ${PORT}`);
      console.log(`Users API: ${baseUrl}/api/users`);
      console.log(`Swagger UI: ${baseUrl}/api-docs`);
      console.log(`OpenAPI: ${baseUrl}/openapi.json`);
      console.log(`Health: ${baseUrl}/health`);
    });
  } catch (err) {
    console.error(`[${serviceName}] startup failed:`, err.message);
    process.exit(1);
  }
}

start();
