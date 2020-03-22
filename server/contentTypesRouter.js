const path = require('path');
const fs = require('fs').promises;
const utils = require('./utils');
const baseRouter = require('./contentRouter');
const { getContentType } = utils;

const createPutOne = root =>
  async function putOne(req, res) {
    const contentType = getContentType(req);

    const contentPath = path.resolve(root, `${contentType}`);
    const items = await utils.readCollectionList(contentPath);
    const newId = items.length ? items[items.length - 1].id + 1 : 0;
    const newContentType = {
      ...req.body.data,
      id: newId,
    };

    const itemPath = path.resolve(root, `${contentType}`, `${newId}.json`);
    const newDirPath = path.resolve(root, `${req.body.data.type}`);
    await Promise.all([utils.save(itemPath, newContentType, utils.ensureDir(newDirPath))]);

    res.send(newContentType);
  };

async function patch(root, itemId, contentType, updateParams) {
  const contentPath = path.resolve(root, `${contentType}`, `${itemId}.json`);
  const item = await utils.read(contentPath);
  const newItem = {
    ...item,
    ...updateParams,
  };

  if (updateParams.type) {
    const contentFolderPath = path.resolve(root, 'content', item.type);
    const newContentFolderPath = path.resolve(root, 'content', updateParams.type);
    await fs.rename(contentFolderPath, newContentFolderPath);
  }
  await utils.save(contentPath, newItem);
  return newItem;
}

const createPatchOne = root =>
  async function patchOneBase(req, res) {
    const contentType = getContentType(req);
    const { itemId } = req.params;
    const params = req.body;

    const data = await patch(root, itemId, contentType, params);

    res.status(200).send({ data });
  };

const createPatchMany = root =>
  async function patchManyBase(req, res) {
    const contentType = getContentType(req);
    const params = req.body;
    const { ids } = req.query;

    const updatePromises = ids.map(id => patch(root, id, contentType, params));

    await Promise.all(updatePromises);

    res.status(200).send({ data: ids });
  };

async function deleteItem(root, contentType, itemId) {
  const contentItemPath = path.resolve(root, `${contentType}`, `${itemId}.json`);
  const { type } = await utils.read(contentItemPath);
  const contentFolderPath = path.resolve(root, `${type}`);

  await Promise.all([utils.remove(contentItemPath), utils.remove(contentFolderPath)]);
  return {};
}

const createDeleteOne = root =>
  async function deleteOne(req, res) {
    const { itemId } = req.params;
    const contentType = getContentType(req);

    await deleteItem(root, contentType, itemId);

    res.send({ data: {} });
  };
const createDeleteMany = root =>
  async function deleteMany(req, res) {
    const contentType = getContentType(req);

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
      patchMany: createPatchMany(root),
      patchOne: createPatchOne(root),
    },
    root,
  );
