const multer = require('multer');
const path = require('path');
const root = path.resolve(__dirname, '../..');
const fse = require('fs-extra');

const createStorage = () => {
  return multer.diskStorage({
    destination: async function(req, file, callback) {
      let destinationDir = path.resolve(root, process.env.MEDIA_UPLOAD_DIRECTORY);
      if (process.env.MEDIA_DATES_FOLDER) {
        destinationDir = path.resolve(
          destinationDir,
          `${new Date().getFullYear()}.${new Date().getMonth() + 1}.${new Date().getDate()}`,
        );
      }
      await fse.ensureDir(destinationDir);

      callback(null, destinationDir);
    },
    filename(req, file, cb) {
      console.log(file);
      cb(null, `${file.originalname}`);
    },
  });
};

const storage = createStorage();
const upload = multer({ storage });

module.exports = {
  upload,
};
