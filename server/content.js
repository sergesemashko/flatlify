const fse = require('fs-extra');
const fs = require('fs');
const path = require('path');

const fileExistError = new Error({ code: 409, message: 'This name is already taken' });

const save = (contentType, contentName, data, cb) => {
  const parsedData = JSON.parse(String(data));
  const filePath = path.resolve('_content', contentType, contentName + '.json');
  const newFilePath = path.resolve('_content', contentType, parsedData.slug + '.json');

  if (contentName === parsedData.slug) {
    fse.outputFile(newFilePath, data, cb);
  } else {
    fs.stat(newFilePath, function(err, stat) {
      if (err === null) {
        throw fileExistError;
      } else if (err.code === 'ENOENT') {
        fs.rename(filePath, newFilePath, err => {
          if (err) throw err;
          fse.outputFile(newFilePath, data, cb);
        });
      } else {
        throw err;
      }
    });
  }
};

const create = (contentType, data, cb) => {
  const parsedData = JSON.parse(String(data));
  const filePath = path.resolve('_content', contentType, parsedData.slug + '.json');
  fs.stat(filePath, function(err, stat) {
    if (err === null) {
      throw fileExistError;
    } else if (err.code === 'ENOENT') {
      fs.appendFile(filePath, data, function(err) {
        if (err) throw err;
      });
    } else {
      throw err;
    }
  });
};

const deleteContent = (contentType, contentName, cb) => {
  const filePath = path.resolve('_content', contentType, contentName + '.json');
  fs.unlink(filePath, err => {
    if (err) throw err;
  });
};

const load = (contentType, slug, cb) => {
  const filePath = path.resolve('_content', contentType, slug + '.json');
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, (err, data) => {
      if (err) {
        return reject(err);
      }

      try {
      } catch (e) {}
      cb(JSON.parse(String(data)));
    });
  });
};
const saveMedia = (filename, currentDate, uuid) => {
  const filePath = path.resolve('_content', 'media', uuid + '.json');
  const data = JSON.stringify({
    filename,
    currentDate,
  });
  fse.outputFile(filePath, data);
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

const getMedia = (uuid, cb) => {
  let mediaUrl = '';
  const promise = new Promise((resolve, reject) => {
    const filePath = path.resolve('_content', 'media', uuid + '.json');
    let mediaPath = '';
    fs.readFile(filePath, 'utf8', (err, data) => {
      const mediaData = JSON.parse(data);
      mediaPath = path.resolve(process.env.MEDIA_FOLDER, mediaData.currentDate, mediaData.filename);

      fs.stat(mediaPath, (err, stat) => {
        if (err === null) {
          mediaUrl = `/${process.env.MEDIA_FOLDER}/${mediaData.currentDate}/${mediaData.filename}`;
        }

        resolve();
      });
    });
  });
  promise.then(() => cb(mediaUrl));
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
  create,
  deleteContent,
};
