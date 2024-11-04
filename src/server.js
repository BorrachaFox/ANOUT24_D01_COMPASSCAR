require('dotenv').config();
const app = require('./app');

const SERVER_PORT = process.env.SERVER_PORT || 3001;

app.listen(SERVER_PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running: http://localhost:${SERVER_PORT}`);
});
