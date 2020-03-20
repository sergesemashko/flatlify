const path = require('path');
const fs = require('fs').promises;
const fse = require('fs-extra');

function ensureDir(dir) {
  return fse.ensureDir(dir);
}

function save(filepath, json) {
  return fse.outputJson(filepath, json);
}

function read(filepath) {
  return fse.readJson(filepath);
}

function remove(filepath) {
  return fse.remove(filepath);
}

async function readCollectionList(dirname) {
  if (await fse.pathExists(dirname)) {
    const filenames = await fs.readdir(dirname);

    const filesPromises = filenames.map(async filename => {
      const filePath = path.resolve(dirname, filename);
      const stat = await fs.stat(filePath);

      if (stat && stat.isFile()) {
        return fse.readJson(filePath, { encoding: 'utf-8' });
      }
      return null;
    });

    let files = await Promise.all(filesPromises);

    const filteredFiles = files.filter(empty => !!empty);
    return filteredFiles;
  }
}

async function readCollections(dirname) {
  const db = {};
  const dirs = await fs.readdir(dirname);

  await Promise.all(
    dirs.map(dirPath => {
      const dir = path.resolve(dirname, dirPath);
      return fs.stat(dir).then(async stat => {
        if (stat && stat.isDirectory()) {
          db[dirPath] = await readCollectionList(dir);
        }
      });
    }),
  );

  return db;
}
function getContentType(req) {
  const contentType = req.params.contentType.toLowerCase();
  return contentType;
}

module.exports = {
  ensureDir,
  readCollections,
  readCollectionList,
  save,
  read,
  remove,
  getContentType,
};
