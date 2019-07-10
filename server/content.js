const fse = require('fs-extra');
const fs = require('fs');
const path = require('path');

const save = (contentType, contentName, data, cb) => {
  const filePath = path.resolve('_content', contentType, contentName + '.json');
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
  const contentDir = path.resolve(process.env.MEDIA_FOLDER);
  const filesArray = [];
  fs.readdir(contentDir, (err, folders) => {
    const promises = folders.map(folder => {
      return new Promise((resolve, reject) => {
        const mediaDir = path.resolve(process.env.MEDIA_FOLDER, folder);
        fs.readdir(mediaDir, (err, files) => {
          files.forEach(file =>
            filesArray.push({
              url: `${process.env.MEDIA_FOLDER}/${folder}/${file}`,
              filename: file,
            }),
          );
          resolve();
        });
      });
    });

    Promise.all(promises).then(() => cb(filesArray));
  });
};

const getMedia = (uuidArray, cb) => {
  const mediaList = [];
  console.log(uuidArray);
  const promises = uuidArray.map(uuid => {
    const filePath = path.resolve('_content', 'media', uuid + '.json');
    let mediaPath = '';
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, 'utf8', (err, data) => {
        const mediaData = JSON.parse(data);
        mediaPath = path.resolve(
          process.env.MEDIA_FOLDER,
          mediaData.currentDate,
          mediaData.filename,
        );

        fs.stat(mediaPath, (err, stat) => {
          if (err === null) {
            mediaList.push(
              `/${process.env.MEDIA_FOLDER}/${mediaData.currentDate}/${mediaData.filename}`,
            );
          }

          resolve();
        });
      });
    });
  });

  Promise.all(promises).then(() => cb(mediaList));
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
