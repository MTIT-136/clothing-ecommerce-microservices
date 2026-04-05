const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const userRoutes = require('./src/routes/userRoutes');
const { health } = require('./src/controllers/healthController');
const { setupSwagger } = require('./src/config/swagger');
const errorMiddleware = require('./src/middleware/errorMiddleware');

function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

  app.get('/health', health);

  setupSwagger(app);

  app.use('/api/users', userRoutes);
  app.use('/', userRoutes);

  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: 'Route not found',
      data: null,
    });
  });

  app.use(errorMiddleware);

  return app;
}

module.exports = createApp;
