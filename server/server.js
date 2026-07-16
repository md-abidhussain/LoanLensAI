const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const initDb = require('./database/initDb');
const scanRoutes = require('./routes/scanRoutes');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api', scanRoutes);

app.use(express.static(path.join(__dirname, '../client')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

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
