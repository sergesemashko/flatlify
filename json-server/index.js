const path = require('path');
const low = require('lowdb');
const FileAsync = require('lowdb/adapters/FileAsync');
const jsonServer = require('json-server');
const server = jsonServer.create();
const jsondiffpatch = require('jsondiffpatch');
const debug = require('debug')('flatlify:json-server');
const { readCollections, readCollectionList, save, read, remove, ensureDir } = require('./utils');

class MyStorage {
  constructor(source, options = {}) {
    const { defaultValue = {} } = options;
    this.fileAsync = new FileAsync(source, options);
    this.__state__ = defaultValue;
    this.read = this.read.bind(this);
    this.write = this.write.bind(this);
  }

  async read(...args) {
    debug('Read params %O', args);
    // Should return data (object or array) or a Promise

    const collections = await readCollections(path.resolve(__dirname, 'db'));
    debug('Collections %O', collections);
    // const lists = await Promise.all(
    //   collections.map(collection => readCollectionList(collection))
    // );

    // debug('collectionLists %O', lists);
    return collections;
    return this.fileAsync.read(...args).then(results => {
      this.__state__ = JSON.parse(JSON.stringify(results));
      return results;
    });
  }

  write(data) {
    debug('write, state = %O:', this.__state__);
    debug('write, data = %O:', data);
    const delta = jsondiffpatch.diff(this.__state__, data);
    debug('write, delta = %O:', JSON.stringify(delta));
    if (typeof delta === 'object') {
      Object.keys(delta).map(collection => {
        Object.keys(delta[collection]).map(index => {
          if (index === '_t') {
            return;
          }

          // insert
          if (Array.isArray(delta[collection][index]) && delta[collection][index].length === 1) {
            const newRow = delta[collection][index][0];
            debug('insert operation =', `collection=${collection} index=${index}`);
            return;
          }

          // update
          if (typeof delta[collection][index] === 'object') {
            const update = delta[collection][index][0];
            debug('update operation =', `collection=${collection} index=${index}`);
          }

          // delete
          if (
            Array.isArray(delta[collection][index]) &&
            delta[collection][index].length === 3 &&
            delta[collection][index][1] === 0 &&
            delta[collection][index][2] === 0
          ) {
            const newRow = delta[collection][index][0];
            debug('delete operation =', `collection=${collection} index=${index}`);
          }

          // move
          if (
            Array.isArray(delta[collection][index]) &&
            delta[collection][index].length === 3 &&
            delta[collection][index][1] !== 0 &&
            delta[collection][index][2] !== 0
          ) {
            const newRow = delta[collection][index][0];
            debug('move operation =', `collection=${collection} index=${index}`);
          }
        });
      });
    }
    return this.fileAsync.write(data).then(results => {
      this.__state__ = JSON.parse(JSON.stringify(data));
      debug('after write, results = %O:', results);
      return results;
    });
    // Should return nothing or a Promise
  }
}
function logResponseBody(req, res, next) {
  let oldWrite = res.write,
    oldEnd = res.end;

  let chunks = [];

  res.write = function(chunk) {
    chunks.push(chunk);

    oldWrite.apply(res, arguments);
  };

  res.end = function(chunk) {
    if (chunk) chunks.push(chunk);

    let body = Buffer.concat(chunks).toString('utf8');

    oldEnd.apply(res, arguments);
  };
  next();
}

const adapter = new MyStorage(path.join(__dirname, 'db.json'));
low(adapter).then(DB => {
  const router = jsonServer.router(DB);

  router.render = async (req, res) => {
    let filteredResponse = res.locals.data;

    debug('req.method=', req.method);
    debug('req.path=', req.path);
    debug('req.params=', req.params);
    debug('req.query=', req.query);
    debug('req.body=', req.body);
    if (req.method === 'GET') {
      const paths = req.path.split('/').filter(empty => !!empty);
      debug('GET paths=%O', paths);
      const contentType = paths[0];
      const dirPath = path.join(__dirname, 'db', contentType);
      await ensureDir(contentType);
      if (paths.length === 2) {
        const id = paths[1];
        debug('GET filename=', path.join(dirPath, `${id}.json`));
        // await remove(path.join(__dirname, 'db', contentType, `${id}.json`));
        res.status(200);
        if (id !== undefined) {
          const data = await read(path.join(dirPath, `${id}.json`));
          return res.jsonp(data);
        }
      } else {
        res.status(200);
        const rows = await readCollectionList(dirPath);
        debug('GET rows=%O', rows);
        return res.jsonp(rows);
      }
    }
    if (req.method === 'DELETE') {
      const paths = req.path.split('/').filter(empty => !!empty);
      if (paths.length === 2) {
        const contentType = paths[0];
        const id = paths[1];
        debug('DELETE filename=', path.join(__dirname, 'db', contentType, `${id}.json`));
        await remove(path.join(__dirname, 'db', contentType, `${id}.json`));
      }
    }

    if (req.method === 'POST') {
      const paths = req.path.split('/').filter(empty => !!empty);
      if (paths.length === 1) {
        const contentType = paths[0];
        const data = req.body;
        const id = req.body.id;
        debug('POST filename=', path.join(__dirname, 'db', contentType, `${id}.json`));
        await save(path.join(__dirname, 'db', contentType, `${id}.json`), data);
      }
    }
    if (req.method === 'PUT') {
      const paths = req.path.split('/').filter(empty => !!empty);
      if (paths.length === 2) {
        const contentType = paths[0];
        const id = paths[1];
        const data = req.body;
        debug('PUT filename=', path.join(__dirname, 'db', contentType, `${id}.json`));
        await save(path.join(__dirname, 'db', contentType, `${id}.json`), data);
      }
    }

    // optional response wrapping to data attribute
    res.jsonp(res.locals.data);
  };

  const middlewares = jsonServer.defaults();
  // const { registerGitAPI } = require('../server/git-api');
  server.use(logResponseBody);

  server.use(middlewares);
  server.use(jsonServer.bodyParser);

  server.use(async (req, res, next) => {
    res.header('Access-Control-Expose-Headers', 'X-Total-Count');

    next();
  });
  // registerGitAPI(server, path.resolve('..'));
  server.use(router);
  server.listen(3000, () => {});
});
// const router = jsonServer.router(path.join(__dirname, 'db.json'));
