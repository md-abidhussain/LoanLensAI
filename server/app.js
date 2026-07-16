const express = require('express');
const cors = require('cors');
const path = require('path');
const scanRoutes = require('./routes/scanRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', scanRoutes);

app.use(express.static(path.join(__dirname, '../client')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

module.exports = app;
