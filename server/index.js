const express = require('express');
const next = require('next');
const bodyParser = require('body-parser');
const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const multer = require('multer');
const uuidv4 = require('uuid/v4');

const content = require('./content');
const contentType = require('./content-type');

const createStorage = () => {
  const currentDate = `${new Date().getMonth() +
    1}.${new Date().getDate()}.${new Date().getFullYear()}`;
  return multer.diskStorage({
    destination: `./${process.env.MEDIA_FOLDER}/${currentDate}`,
    filename(req, file, cb) {
      cb(null, `${file.originalname}`);
    },
  });
};

const storage = createStorage();

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

  server.get('/_api/content/media/:uuid', (req, res) => {
    const fileUuid = req.params.uuid;
    return content.getMedia(fileUuid, result => {
      res.send(result);
    });
  });

  server.get('/_api/content/media', (req, res) => {
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

  server.delete('/_api/content/media', (req, res) => {
    const path = JSON.parse(req.query.name).url;
    return content.removeMedia(path, result => {
      res.send(result);
    });
  });

  server.post('/_api/content/media', (req, res) => {
    const maxFilesCount = 12;
    const promise = new Promise((resolve, reject) => {
      upload.array('file', maxFilesCount)(req, res, err => {
        if (err) {
          reject(err);
        }

        resolve();
      });
    });

    promise
      .then(() => {
        return res.send(true);
      })
      .catch(err => {
        return res.status(400).send(true);
      });
  });

  server.post('/_api/content/:type/:slug', (req, res) => {
    if (req.body['media-data']) {
      const currentDate = `${new Date().getMonth() +
        1}.${new Date().getDate()}.${new Date().getFullYear()}`;

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
