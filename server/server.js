require('dotenv').config();
const initDb = require('./database/initDb');
const app = require('./app');

const port = process.env.PORT || 3000;

initDb()
  .then(() => {
    app.listen(port, () => {
      console.log('server is running on port', port);
    });
  })
  .catch((err) => {
    console.error('database initialization error', err.message);
    process.exit(1);
  });
