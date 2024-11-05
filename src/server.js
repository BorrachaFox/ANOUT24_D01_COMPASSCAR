require('dotenv').config();
const app = require('./app');
const { closePool } = require('./config/db');

const SERVER_PORT = process.env.SERVER_PORT || 3001;

app.listen(SERVER_PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running: http://localhost:${SERVER_PORT}`);
});

// Close pool connection
process.on('SIGINT', async () => {
  await closePool();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closePool();
  process.exit(0);
});
