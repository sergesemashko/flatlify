const express = require('express');
const next = require('next');
const bodyParser = require('body-parser');
const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const multer = require('multer');
const uuidv4 = require('uuid/v4');
const queryString = require('querystring');

const content = require('./content');
const contentType = require('./content-type');
const currentDate = `${new Date().getMonth() +
  1}.${new Date().getDate()}.${new Date().getFullYear()}`;

const storage = multer.diskStorage({
  destination: `./static/${currentDate}`,
  filename(req, file, cb) {
    cb(null, `${file.originalname}`);
  },
});

const upload = multer({ storage });

app.prepare().then(() => {
  const server = express();
  server.use(bodyParser.json()); // support json encoded bodies
  server.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

  server.get('/_api/content', (req, res) => {
    return content.listTypes(files => {
      res.send(JSON.stringify(files));
    });
  });

  server.get('/_api/content/getMedia', (req, res) => {
    console.log(req.query);
    if (Array.isArray(req.query.file)) {
      return content.getMedia(req.query.file, result => {
        res.send(result);
      });
    } else {
      return content.getMedia([req.query.file], result => {
        res.send(result);
      });
    }
  });

  server.get('/_api/content/mediaList', (req, res) => {
    return content.mediaList(files => {
      res.send(JSON.stringify(files));
    });
  });

  server.get('/_api/content-type/:type', (req, res) => {
    return contentType.loadSchema(req.params.type, files => {
      res.send(JSON.stringify(files));
    });
  });

  server.get('/_api/content/:type', (req, res) => {
    return content.list(req.params.type, files => {
      res.send(JSON.stringify(files));
    });
  });

  server.get('/_api/content/:type/:slug', (req, res) => {
    return content.load(req.params.type, req.params.slug, data => {
      res.send(JSON.stringify(data));
    });
  });

  server.delete('/_api/content/removeMedia', (req, res) => {
    return content.removeMedia(req.query.name, result => {
      res.send(result);
    });
  });

  server.post('/_api/media', (req, res) => {
    const promise = new Promise((resolve, reject) => {
      upload.array('file', 12)(req, res, err => {
        console.log('MIDDLEWARE');
        if (err) {
          console.log('ERROOOO');
          console.log(err);
          reject(err);
        }

        resolve();
      });
    });

    promise
      .then(() => {
        console.log('SUCCESS PROMISE');
        return res.send(true);
      })
      .catch(err => {
        console.log('ERROR PROMISE');
        return res.status(400).send(true);
      });
  });

  server.post('/_api/content/:type/:slug', (req, res) => {
    if (req.body['media-data']) {
      req.body['media-data'].forEach((item, index) => {
        const uuid = uuidv4();
        content.saveMedia(item, currentDate, uuid);
        req.body['media-data'][index] = uuid;
      });
    }

    return content.save(
      req.params.type,
      req.params.slug,
      JSON.stringify(req.body, null, 2),
      data => {
        res.send('');
      },
    );
  });

  server.get('*', (req, res) => {
    handle(req, res);
  });

  server.listen(port, err => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});
