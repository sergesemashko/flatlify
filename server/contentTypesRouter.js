const path = require('path');
const utils = require('./utils');
const baseRouter = require('./contentRouter');

const createPutOne = root =>
  async function putOne(req, res) {
    const { contentType } = req.params;

    const contentPath = path.resolve(root, 'server/db', `${contentType}`);
    const items = await utils.readCollectionList(contentPath);
    const newId = items.length ? items[items.length - 1].id + 1 : 0;
    const newContentType = {
      ...req.body.data,
      id: newId,
    };

    const itemPath = path.resolve(root, 'server/db', `${contentType}`, `${newId}.json`);
    const newDirPath = path.resolve(root, 'server/db', `${req.body.data.type}`);
    await Promise.all([utils.save(itemPath, newContentType, utils.ensureDir(newDirPath))]);

    res.send(newContentType);
  };

async function deleteItem(root, contentType, itemId) {
  const contentItemPath = path.resolve(root, 'server/db', `${contentType}`, `${itemId}.json`);
  const { type } = await utils.read(contentItemPath);
  const contentFolderPath = path.resolve(root, 'server/db', `${type}`);

  await Promise.all([utils.remove(contentItemPath), utils.remove(contentFolderPath)]);
  return {};
}

const createDeleteOne = root =>
  async function deleteOne(req, res) {
    const { contentType, itemId } = req.params;

    await deleteItem(root, contentType, itemId);

    res.send({ data: {} });
  };
const createDeleteMany = root =>
  async function deleteMany(req, res) {
    const { contentType } = req.params;
    const ids = req.body;

    const deletePromises = ids.map(id => deleteItem(root, contentType, id));
    await Promise.all(deletePromises);

    res.send({ data: {} });
  };
module.exports = root =>
  baseRouter(
    {
      deleteOne: createDeleteOne(root),
      deleteMany: createDeleteMany(root),
      putOne: createPutOne(root),
    },
    root,
  );
