const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const contentRouter = require('./contentRouter');
const contentTypesRouter = require('./contentTypesRouter');
const gitRouter = require('./gitRouter');

const app = express();
const port = parseInt(process.env.PORT, 10) || 3020;
const root = path.resolve(__dirname, '..');

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(cors());
app.use('/content-types', contentTypesRouter(root));
app.use('/modified-files', gitRouter(root));
app.use('/', contentRouter(root));
app.listen(port, err => {
  if (err) throw err;
});
