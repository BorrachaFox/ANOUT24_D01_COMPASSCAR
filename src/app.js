const express = require('express');
const cors = require('cors');
const carsRouter = require('./routes/carsRouter');

const app = express();

app.use(express.json());
app.use(cors());

app.use('/api/v1/cars', carsRouter);

app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use((err, req, res, next) => {
  const statusCode = err.status || 500;

  if (statusCode === 500) {
    res.status(500).json({ errors: ['An internal server error occurred'] });
  }

  const errorResponse = {
    errors: err.details || [err.message],
  };

  res.status(statusCode).json(errorResponse);
  next(err);
});

module.exports = app;
