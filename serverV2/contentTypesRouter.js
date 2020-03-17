const path = require('path');
const utils = require('./utils');
const baseRouter = require('./contentRouter');

async function putOne(req, res) {
  const { contentType } = req.params;

  const contentPath = path.resolve(path.resolve('db', `${contentType}`));
  const items = await utils.readCollectionList(contentPath);
  const newId = items.length ? items[items.length - 1].id + 1 : 0;
  const newContentType = {
    ...req.body.data,
    id: newId,
  };

  const itemPath = path.resolve('db', `${contentType}`, `${newId}.json`);
  const newDirPath = path.resolve('db', `${req.body.data.type}`);
  await Promise.all([utils.save(itemPath, newContentType, utils.ensureDir(newDirPath))]);

  res.send(newContentType);
}
async function deleteItem(contentType, itemId) {
  const contentItemPath = path.resolve('db', `${contentType}`, `${itemId}.json`);
  const { type } = await utils.read(contentItemPath);
  const contentFolderPath = path.resolve('db', `${type}`);

  await Promise.all([utils.remove(contentItemPath), utils.remove(contentFolderPath)]);
  return {};
}
async function deleteOne(req, res) {
  const { contentType, itemId } = req.params;

  await deleteItem(contentType, itemId);

  res.send({ data: {} });
}

async function deleteMany(req, res) {
  const { contentType } = req.params;
  const ids = req.body;

  const deletePromises = ids.map(id => deleteItem(contentType, id));
  await Promise.all(deletePromises);

  res.send({ data: {} });
}
module.exports = () => baseRouter({ deleteOne, deleteMany, putOne });
