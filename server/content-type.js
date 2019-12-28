// const contentType = require('../core/entities/content-type');
const glob = require('glob');
const path = require('path');
const fse = require('fs-extra');
const loadSchema = (contentType, cb) => {
  cb(contentType.getContentTypeMeta(contentType));
};

const getList = cb => {
  glob('configs/content-types/*.json', {}, (er, files) => {
    if (er) {
      cb(er);
    }
    console.log(path.resolve('../configs/content-types/*.json'), files);
    Promise.all(files.map(file => fse.readJson(file)))
      .then(cb.bind(this, null))
      .catch(cb);
  });
};

module.exports = {
  loadSchema,
  getList,
};
