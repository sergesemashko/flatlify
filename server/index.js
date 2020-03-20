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

const contentTypesRoot = path.resolve(root, 'server/db');
app.use('/content-types', contentTypesRouter(contentTypesRoot));

app.use('/modified-files', gitRouter(root));

const contentRoot = path.resolve(root, 'server/db/content');
app.use('/', contentRouter({}, contentRoot));

app.listen(port, err => {
  if (err) throw err;
});
