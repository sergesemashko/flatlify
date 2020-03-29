const express = require('express');
const path = require('path');
const utils = require('./utils');
const { orderBy, slice } = require('lodash');
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

async function patch(root, itemId, contentType, updateParams) {
  const contentPath = path.resolve(root, `${contentType}`, `${itemId}.json`);
  const item = await utils.read(contentPath);
  const newItem = {
    ...item,
    ...updateParams,
  };
  await utils.save(contentPath, newItem);
  return newItem;
}

const createPatchOneBase = root =>
  async function patchOneBase(req, res) {
    const contentType = getContentType(req);
    const { itemId } = req.params;
    const params = req.body;

    const data = await patch(root, itemId, contentType, {
      ...params,
      ...extractFilesMeta(req.files),
    });

    res.status(200).send({ data });
  };

const createPatchManyBase = root =>
  async function patchManyBase(req, res) {
    const contentType = getContentType(req);
    const params = req.body;
    const { ids } = req.query;

    const updatePromises = ids.map(id => patch(root, id, contentType, params));

    await Promise.all(updatePromises);

    res.status(200).send({ data: ids });
  };

const createPutOneBase = root =>
  async function putOneBase(req, res) {
    const contentType = getContentType(req);

    const contentPath = path.resolve(root, `${contentType}`);
    const items = await utils.readCollectionList(contentPath);
    const newId = items.length ? items[items.length - 1].id + 1 : 0;
    const newContentType = { ...req.body, ...extractFilesMeta(req.files), id: newId };

    const itemPath = path.resolve(root, `${contentType}`, `${newId}.json`);
    await utils.save(itemPath, newContentType);

    res.send(newContentType);
  };

async function deleteItem(root, contentType, itemId) {
  const contentItemPath = path.resolve(root, `${contentType}`, `${itemId}.json`);

  await utils.remove(contentItemPath);
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

module.exports = (methods = {}, root = __dirname) => {
  const {
    getMany = createGetManyBase(root),
    getOne = createGetOneBase(root),
    patchOne = createPatchOneBase(root),
    patchMany = createPatchManyBase(root),
    putOne = createPutOneBase(root),
    deleteOne = createDeleteOneBase(root),
    deleteMany = createDeleteManyBase(root),
  } = methods;
  const router = express.Router();

  router.get('/:contentType', getMany);

  router.get('/:contentType/:itemId', getOne);

  router.patch('/:contentType/:itemId', uploadMiddleware, patchOne);

  router.patch('/:contentType', uploadMiddleware, patchMany);

  router.post('/:contentType', uploadMiddleware, putOne);

  router.delete('/:contentType/:itemId', deleteOne);

  router.delete('/:contentType', deleteMany);

  return router;
};
