const express = require('express');
const path = require('path');
const utils = require('./utils/common');
const { orderBy, slice } = require('lodash');
const gitUtils = require('./git-utils');
const { getContentType } = utils;
const { upload, extractFilesMeta, fileFieldsAppendSrc } = require('./utils/media');
const uploadMiddleware = upload.any();

const createGetManyBase = root =>
  async function getManyBase(req, res) {
    const contentType = getContentType(req);

    const pagination = req.query && req.query.pagination ? JSON.parse(req.query.pagination) : {};
    const sort = req.query && req.query.sort ? JSON.parse(req.query.sort) : {};

    const _start = (pagination.page - 1) * pagination.perPage || 0;
    const _end = pagination.page * pagination.perPage || 25;
    const _order = sort.order || 'ASC';
    const _sort = sort.field || 'id';

    const contentPath = path.resolve(root, `${contentType}`);
    const files = await utils.readCollectionList(contentPath);
    const items = fileFieldsAppendSrc(slice(orderBy(files, [_sort], [_order]), _start, _end));

    res.setHeader('Access-Control-Expose-Headers', 'X-Total-Count');
    res.setHeader('X-Total-Count', items.length);
    res.send({
      data: items,
      total: files.length,
    });
  };

const createGetOneBase = root =>
  async function getOneBase(req, res) {
    const { itemId } = req.params;
    const contentType = getContentType(req);

    const contentPath = path.resolve(root, `${contentType}`, `${itemId}.json`);
    const [data] = fileFieldsAppendSrc([await utils.read(contentPath)]);
    res.send({ data });
  };

async function update(root, itemId, contentType, updateParams) {
  const relativeContentPath = `${contentType}/${itemId}.json`;
  const contentPath = `${root}/${relativeContentPath}`;

  const item = await utils.read(contentPath);
  const newItem = {
    ...item,
    ...updateParams,
  };

  await utils.save(contentPath, newItem);

  await gitUtils.commit([contentPath], {
    message: `Flatlify updated file: ${relativeContentPath}`,
  });
  return newItem;
}

const createUpdateOneBase = root =>
  async function updateOneBase(req, res) {
    const contentType = getContentType(req);
    const { itemId } = req.params;
    const params = req.body;

    const data = await update(root, itemId, contentType, {
      ...params,
      ...extractFilesMeta(req.files),
    });

    res.status(200).send({ data });
  };

const createUpdateManyBase = root =>
  async function updateManyBase(req, res) {
    const contentType = getContentType(req);
    const params = req.body;
    const { ids } = req.query;

    const updatePromises = ids.map(id => update(root, id, contentType, params));

    await Promise.all(updatePromises);

    res.status(200).send({ data: ids });
  };

const createCreateOneBase = root =>
  async function createOneBase(req, res) {
    const contentType = getContentType(req);

    const contentPath = path.resolve(root, `${contentType}`);
    const items = await utils.readCollectionList(contentPath);
    const newId = utils.getNewIdFromDatabaseItems(items);

    const newContentType = { ...req.body, ...extractFilesMeta(req.files), id: newId };

    const relativeItemPath = `${contentType}/${newId}.json`;
    const itemPath = `${root}/${relativeItemPath}`;

    await utils.save(itemPath, newContentType);

    await gitUtils.commit([itemPath], {
      message: `Flatlify created file: ${relativeItemPath}`,
    });

    res.send(newContentType);
  };

async function deleteItem(root, contentType, itemId) {
  const relativeItemPath = `${contentType}/${itemId}.json`;
  const contentItemPath = `${root}/${relativeItemPath}`;

  await utils.remove(contentItemPath);

  await gitUtils.commit([contentItemPath], {
    message: `Flatlify deleted file: ${relativeItemPath}`,
    remove: true,
  });

  return {};
}

const createDeleteOneBase = root =>
  async function deleteOneBase(req, res) {
    const { itemId } = req.params;
    const contentType = getContentType(req);

    await deleteItem(root, contentType, itemId);

    res.send({ data: {} });
  };

const createDeleteManyBase = root =>
  async function deleteManyBase(req, res) {
    const contentType = getContentType(req);
    const ids = req.body;

    const deletePromises = ids.map(id => deleteItem(root, contentType, id));
    await Promise.all(deletePromises);

    res.send({ data: {} });
  };

module.exports = {
  createGetManyBase,
  createGetOneBase,
  router: (methods = {}, root = __dirname) => {
    const {
      getMany = createGetManyBase(root),
      getOne = createGetOneBase(root),
      updateOne = createUpdateOneBase(root),
      updateMany = createUpdateManyBase(root),
      createOne = createCreateOneBase(root),
      deleteOne = createDeleteOneBase(root),
      deleteMany = createDeleteManyBase(root),
    } = methods;
    const router = express.Router();

    router.get('/:contentType', getMany);

    router.get('/:contentType/:itemId', getOne);

    router.put('/:contentType/:itemId', uploadMiddleware, updateOne);

    router.put('/:contentType', uploadMiddleware, updateMany);

    router.post('/:contentType', uploadMiddleware, createOne);

    router.delete('/:contentType/:itemId', deleteOne);

    router.delete('/:contentType', deleteMany);

    return router;
  },
};
