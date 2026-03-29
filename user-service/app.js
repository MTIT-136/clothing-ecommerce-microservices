const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const userRoutes = require('./src/routes/userRoutes');
const {
  swaggerSpec,
  swaggerUiServe,
  swaggerUiSetup,
} = require('./src/config/swagger');
const errorMiddleware = require('./src/middleware/errorMiddleware');

function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

  app.get('/health', (req, res) => {
    res.status(200).json({
      service: process.env.SERVICE_NAME || 'user-service',
      status: 'ok',
      message: 'User service is running',
    });
  });

  app.get('/openapi.json', (req, res) => {
    res.json(swaggerSpec);
  });

  app.use('/api-docs', swaggerUiServe, swaggerUiSetup);

  app.use('/api/users', userRoutes);

  app.use((req, res, next) => {
    const err = new Error('Not found');
    err.statusCode = 404;
    next(err);
  });

  app.use(errorMiddleware);

  return app;
}

module.exports = createApp;
