const path = require('path');
const fs = require('fs').promises;
const gitUtils = require('./git-utils');
const utils = require('./utils/common');
const { router: baseRouter } = require('./contentRouter');
const { getContentType } = utils;
const { createGetOneBase, createGetManyBase } = require('./contentRouter');

const createCreateOne = root =>
  async function putOne(req, res) {
    const contentType = getContentType(req);

    const contentPath = path.resolve(root, `${contentType}`);
    const items = await utils.readCollectionList(contentPath);

    const newId = utils.getNewIdFromDatabaseItems(items);

    const newContentType = {
      ...req.body,
      id: newId,
    };
    const relativeItemPath = `${contentType}/${newId}.json`;
    const itemPath = `${root}/${relativeItemPath}`;
    const newDirPath = path.resolve(root, `${req.body.type.toLowerCase()}`);

    await Promise.all([utils.save(itemPath, newContentType, utils.ensureDir(newDirPath))]);

    await gitUtils.commit([itemPath], {
      message: `Flatlify created file: ${relativeItemPath}`,
    });

    res.send(newContentType);
  };

async function update(root, itemId, contentType, updateParams) {
  const relativeContentPath = `${contentType}/${itemId}.json`;
  const contentPath = `${root}/${relativeContentPath}`;

  const item = await utils.read(contentPath);
  const newItem = {
    ...item,
    ...updateParams,
  };

  if (updateParams.type) {
    const contentFolderPath = path.resolve(root, 'content', item.type.toLowerCase());
    const newContentFolderPath = path.resolve(root, 'content', updateParams.type.toLowerCase());
    utils.ensureDir(contentFolderPath);
    await fs.rename(contentFolderPath, newContentFolderPath);
  }
  await utils.save(contentPath, newItem);

  await gitUtils.commit([contentPath], {
    message: `Flatlify updated file: ${relativeContentPath}`,
  });

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
  const relativeItemPath = `${contentType}/${itemId}.json`;
  const contentItemPath = `${root}/${relativeItemPath}`;

  const { type } = await utils.read(contentItemPath);
  const contentFolderPath = path.resolve(root, `${type.toLowerCase()}`);

  await gitUtils.commit([contentItemPath], {
    message: `Flatlify deleted file: ${relativeItemPath}`,
    remove: true,
  });

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
