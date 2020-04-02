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
    cb(null, `${fileMeta.name}-${uniqueSuffix}${fileMeta.ext}`);
  },
});
const upload = multer({ storage });

const appendSrc = file => {
  return {
    ...file,
    src: `${process.env.MEDIA_PUBLIC_BASE_URL}${file.relativeSrc}`,
  };
};

const fileFieldsAppendSrc = (files = []) => {
  return files.map(file => {
    const updatedEntry = { ...file };
    for (const fieldName in file) {
      if (Array.isArray(file[fieldName])) {
        updatedEntry[fieldName] = file[fieldName].map(field => {
          if (get(field, 'filename')) {
            return appendSrc(field);
          }
          return field;
        });
      } else if (get(file[fieldName], 'filename')) {
        updatedEntry[fieldName] = appendSrc(updatedEntry[fieldName]);
      }
    }
    return updatedEntry;
  });
};

const extractFilesMeta = (files = []) => {
  return files.reduce((result, file) => {
    const newFieldValue = {
      relativeSrc: `/${path.relative(root, file.path)}`,
      filename: file.filename,
      size: file.size,
      mimetype: file.mimetype,
    };
    if (typeof result[file.fieldname] !== 'undefined') {
      if (Array.isArray(result[file.fieldname])) {
        result[file.fieldname] = [...result[file.fieldname], newFieldValue];
      } else {
        result[file.fieldname] = [result[file.fieldname], newFieldValue];
      }
    } else {
      result[file.fieldname] = newFieldValue;
    }
    return result;
  }, {});
};

module.exports = {
  upload,
  extractFilesMeta,
  fileFieldsAppendSrc,
};
