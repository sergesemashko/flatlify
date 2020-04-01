const path = require('path');
const fs = require('fs').promises;
const utils = require('./utils');
const { router: baseRouter } = require('./contentRouter');
const { getContentType } = utils;
const { createGetOneBase, createGetManyBase } = require('./contentRouter');

const createCreateOne = root =>
  async function putOne(req, res) {
    const contentType = getContentType(req);

    const contentPath = path.resolve(root, `${contentType}`);
    const items = await utils.readCollectionList(contentPath);
    const newId = items.length ? items[items.length - 1].id + 1 : 0;
    const newContentType = {
      ...req.body,
      id: newId,
    };
    console.log(req.body);
    const itemPath = path.resolve(root, `${contentType}`, `${newId}.json`);
    const newDirPath = path.resolve(root, `${req.body.type.toLowerCase()}`);
    await Promise.all([utils.save(itemPath, newContentType, utils.ensureDir(newDirPath))]);

    res.send(newContentType);
  };

async function update(root, itemId, contentType, updateParams) {
  const contentPath = path.resolve(root, `${contentType}`, `${itemId}.json`);
  const item = await utils.read(contentPath);
  const newItem = {
    ...item,
    ...updateParams,
  };

  if (updateParams.type) {
    const contentFolderPath = path.resolve(root, 'content', item.type.toLowerCase());
    const newContentFolderPath = path.resolve(root, 'content', updateParams.type.toLowerCase());
    await fs.rename(contentFolderPath, newContentFolderPath);
  }
  await utils.save(contentPath, newItem);
  return newItem;
}

const createUpdateOne = root =>
  async function patchOneBase(req, res) {
    const contentType = getContentType(req);
    const { itemId } = req.params;
    const params = req.body;

    const data = await update(root, itemId, contentType, params);

    res.status(200).send({ data });
  };

const createUpdateMany = root =>
  async function patchManyBase(req, res) {
    const contentType = getContentType(req);
    const params = req.body;
    const { ids } = req.query;

    const updatePromises = ids.map(id => update(root, id, contentType, params));

    await Promise.all(updatePromises);

    res.status(200).send({ data: ids });
  };

async function deleteItem(root, contentType, itemId) {
  const contentItemPath = path.resolve(root, `${contentType}`, `${itemId}.json`);
  const { type } = await utils.read(contentItemPath);
  const contentFolderPath = path.resolve(root, `${type.toLowerCase()}`);

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

module.exports = {
  router: root =>
    baseRouter(
      {
        getOne: createGetOneBase(root),
        getMany: createGetManyBase(root),
        deleteOne: createDeleteOne(root),
        deleteMany: createDeleteMany(root),
        createOne: createCreateOne(root),
        updateMany: createUpdateMany(root),
        updateOne: createUpdateOne(root),
      },
      root,
    ),
};
