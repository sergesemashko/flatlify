const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const low = require('lowdb');
const contentRouter = require('./contentRouter');
const contentTypesRouter = require('./contentTypesRouter');

const app = express();
const port = parseInt(process.env.PORT, 10) || 3020;
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(cors());

const FileAsync = require('lowdb/adapters/FileAsync');

const adapter = new FileAsync('db.json');
const db = low(adapter);

db.then(db => db.read()).then(() => {
  app.use('/content-types', contentTypesRouter());
  app.use('/', contentRouter());
  app.listen(port, err => {
    if (err) throw err;
  });
});
