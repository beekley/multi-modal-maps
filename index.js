const path = require('path');
const secrets = require(__dirname + '/secrets.js');

const express = require('express');
const app = express();

const PORT = 3000;

app.set('view engine', 'pug')
app.use('/client', express.static(path.join(__dirname, 'client')))

app.get('/', (req, res) => {
  res.render(__dirname + '/client/index.pug', { name: 'Brett', gmapkey: secrets.gmapkey });
});

app.listen(PORT, () => console.log(`Listening on PORT: ${PORT}`));