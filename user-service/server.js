require('dotenv').config();

const app = require('./app');
const { connectDB } = require('./src/config/db');

const PORT = Number(process.env.PORT) || 3001;

async function start() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      const baseUrl = `http://localhost:${PORT}`;
      console.log(`Server running on port ${PORT}`);
      console.log(`Users API: ${baseUrl}/api/users`);
      console.log(`Swagger: ${baseUrl}/api-docs`);
      console.log(`Health: ${baseUrl}/health`);
    });
  } catch (err) {
    console.error('Startup failed:', err.message);
    process.exit(1);
  }
}

start();
