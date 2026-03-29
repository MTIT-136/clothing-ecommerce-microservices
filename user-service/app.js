const express = require('express');
const cors = require('cors');

const userRoutes = require('./src/routes/userRoutes');
const { swaggerUiServe, swaggerUiSetup } = require('./src/config/swagger');
const errorMiddleware = require('./src/middleware/errorMiddleware');

const app = express();

app.use(express.json());
app.use(cors());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'User service is running' });
});

app.use('/api/users', userRoutes);

app.use('/api-docs', swaggerUiServe, swaggerUiSetup);

app.use((req, res, next) => {
  const err = new Error('Not found');
  err.statusCode = 404;
  next(err);
});

app.use(errorMiddleware);

module.exports = app;
