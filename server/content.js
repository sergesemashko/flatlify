const fse = require('fs-extra');
const fs = require('fs');
const path = require('path');

const save = (contentType, contentName, data, cb) => {
  const filePath = path.resolve('_content', 'article', contentName + '.json');
  fse.outputFile(filePath, data, cb);
};

const saveMedia = (filename, currentDate, uuid) => {
  const filePath = path.resolve('_content', 'media', uuid + '.json');
  const data = JSON.stringify({
    filename,
    currentDate,
  });
  fse.outputFile(filePath, data);
};

const load = (contentType, contentSlug, cb) => {
  const filePath = path.resolve('_content', contentType, contentSlug + '.json');
  fs.readFile(filePath, (err, data) => {
    cb(JSON.parse(String(data)));
  });
};

const list = (type, cb) => {
  const contentDir = path.resolve('_content', type);
  readFiles(contentDir, cb);
};

const listTypes = cb => {
  const contentDir = path.resolve('configs', 'content-types');
  readFiles(contentDir, types => {
    cb(types.map(entry => entry.type));
  });
};

const mediaList = cb => {
  const contentDir = path.resolve('static');
  const filesArray = [];
  fs.readdir(contentDir, (err, folders) => {
    folders.forEach(folder => {
      const mediaDir = path.resolve('static', folder);
      fs.readdir(mediaDir, (err, files) => {
        files.forEach(file => filesArray.push(`static/${folder}/${file}`));
        cb(filesArray);
      });
    });
  });
};

const getMedia = (uuid, cb) => {
  const filePath = path.resolve('_content', 'media', uuid + '.json');
  let mediaPath = '';
  fs.readFile(filePath, 'utf8', (err, data) => {
    const mediaData = JSON.parse(data);
    mediaPath = path.resolve('static', mediaData.currentDate, mediaData.filename);
    fs.stat(mediaPath, (err, stat) => {
      let checkMedia = '';
      if (err === null) {
        checkMedia = `/static/${mediaData.currentDate}/${mediaData.filename}`;
      }

      cb(checkMedia);
    });
  });
};

const removeMedia = (filePath, cb) => {
  fs.unlink(filePath, err => {
    if (err) {
      console.error(err);
      return false;
    }

    return;
  });
};

function readFiles(dirname, cb) {
  fs.readdir(dirname, function(err, filenames) {
    if (err) {
      console.error(err);
      return;
    }

    Promise.all(
      filenames.map(function(filename) {
        return new Promise((resolve, reject) => {
          fs.readFile(path.resolve(dirname, filename), 'utf-8', function(err, content) {
            if (err) {
              console.error(err);
              reject();
            }
            resolve(JSON.parse(content));
          });
        });
      }),
    ).then(files => {
      cb(files);
    });
  });
}

module.exports = {
  list,
  listTypes,
  save,
  load,
  removeMedia,
  mediaList,
  getMedia,
  saveMedia,
};
