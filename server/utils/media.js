const multer = require('multer');
const path = require('path');
const root = path.resolve(__dirname, '../..');
const fse = require('fs-extra');
const get = require('lodash/get');

const storage = multer.diskStorage({
  destination: async function(req, file, callback) {
    let destinationDir = path.resolve(root, process.env.MEDIA_UPLOAD_DIRECTORY);
    if (process.env.MEDIA_DATES_FOLDER) {
      destinationDir = path.resolve(
        destinationDir,
        String(new Date().getFullYear()),
        String(new Date().getMonth() + 1),
        String(new Date().getDate()),
      );
    }
    await fse.ensureDir(destinationDir);

    callback(null, destinationDir);
  },
  async filename(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const fileMeta = path.parse(file.originalname);
    cb(null, `${fileMeta.name}-${uniqueSuffix}${fileMeta.ext ? `.${fileMeta.ext}` : ''}`);
  },
});
const upload = multer({ storage });

const fileFieldsAppendSrc = (entries = []) => {
  return entries.map(entry => {
    const updatedEntry = { ...entry };
    for (const fieldName in entry) {
      if (get(entry[fieldName], 'filename')) {
        updatedEntry[fieldName] = {
          ...updatedEntry[fieldName],
          src: `${process.env.MEDIA_PUBLIC_BASE_URL}${updatedEntry[fieldName].relativeSrc}`,
        };
      }
    }
    return updatedEntry;
  });
};

const extractFilesMeta = (files = []) => {
  return files.reduce((result, file) => {
    result[file.fieldname] = {
      relativeSrc: `/${path.relative(root, file.path)}`,
      filename: file.filename,
      size: file.size,
      mimetype: file.mimetype,
    };
    return result;
  }, {});
};

module.exports = {
  upload,
  extractFilesMeta,
  fileFieldsAppendSrc,
};
