const path = require('path');
const fs = require('fs').promises;
const statAsync = fs.stat;
const readdirAsync = fs.readdir;
const fse = require('fs-extra');

function ensureDir(dir) {
  return fse.ensureDir(dir);
}

function save(filepath, json) {
  return fse.outputJson(filepath, json);
}

function read(filepath, json) {
  return fse.readJson(filepath);
}

function remove(filepath) {
  return fse.remove(filepath);
}

function readCollectionList(dirname) {
  return new Promise(async (resolve, reject) => {
    if (await fse.pathExists(dirname)) {
      fs.readdir(dirname, function(err, filenames) {
        if (err) {
          return reject(err);
        }

        Promise.all(
          filenames.map(filename => {
            const file = path.resolve(dirname, filename);
            return statAsync(file).then(stat => {
              if (stat && stat.isFile()) {
                return fse.readJson(file, { encoding: 'utf-8' });
              }
            });
          }),
        )
          .then(files => files.filter(empty => !!empty))
          .then(resolve)
          .catch(reject);
      });
    } else {
      resolve([]);
    }
  });
}

async function readCollections(dirname) {
  const db = {};
  const dirs = await readdirAsync(dirname);

  await Promise.all(
    dirs.map(dirPath => {
      const dir = path.resolve(dirname, dirPath);
      return statAsync(dir).then(async stat => {
        if (stat && stat.isDirectory()) {
          db[dirPath] = await readCollectionList(dir);
        }
      });
    }),
  );

  return db;
}

module.exports = {
  ensureDir,
  readCollections,
  readCollectionList,
  save,
  read,
  remove,
};
