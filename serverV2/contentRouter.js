const express = require('express');
const path = require('path');
const utils = require('./utils');

async function getManyBase(req, res) {
  const { contentType } = req.params;

  const contentPath = path.resolve(path.resolve('db', `${contentType}`));
  const items = await utils.readCollectionList(contentPath);

  res.setHeader('Access-Control-Expose-Headers', 'X-Total-Count');
  res.setHeader('X-Total-Count', items.length);
  res.send({
    data: items,
    total: items.length,
  });
}

async function getOneBase(req, res) {
  const { itemId, contentType } = req.params;

  const contentPath = path.resolve('db', `${contentType}`, `${itemId}.json`);
  const data = await utils.read(contentPath);

  res.send({ data });
}
async function patch(itemId, contentType, updateParams) {
  const contentPath = path.resolve('db', `${contentType}`, `${itemId}.json`);
  const item = await utils.read(contentPath);
  const newItem = {
    ...item,
    ...updateParams,
  };
  await utils.save(contentPath, newItem);
  return newItem;
}

async function patchOneBase(req, res) {
  const { itemId, contentType } = req.params;
  const params = req.body;

  const data = await patch(itemId, contentType, params);

  res.status(200).send({ data });
}

async function patchManyBase(req, res) {
  const { contentType } = req.params;
  const params = req.body;
  const { ids } = req.query;

  const updatePromises = ids.map(id => patch(id, contentType, params));

  await Promise.all(updatePromises);

  res.status(200).send({ data: ids });
}

async function putOneBase(req, res) {
  const { contentType } = req.params;

  const contentPath = path.resolve(path.resolve('db', `${contentType}`));
  const items = await utils.readCollectionList(contentPath);
  const newId = items.length ? items[items.length - 1].id + 1 : 0;
  const newContentType = { ...req.body.data, id: newId };

  const itemPath = path.resolve('db', `${contentType}`, `${newId}.json`);
  await utils.save(itemPath, newContentType);

  res.send(newContentType);
}
async function deleteItem(contentType, itemId) {
  const contentItemPath = path.resolve('db', `${contentType}`, `${itemId}.json`);

  await utils.remove(contentItemPath);
  return {};
}
async function deleteOneBase(req, res) {
  const { contentType, itemId } = req.params;

  await deleteItem(contentType, itemId);

  res.send({ data: {} });
}

async function deleteManyBase(req, res) {
  const { contentType } = req.params;
  const ids = req.body;

  const deletePromises = ids.map(id => deleteItem(contentType, id));
  await Promise.all(deletePromises);

  res.send({ data: {} });
}

module.exports = (methods = {}) => {
  const {
    getMany = getManyBase,
    getOne = getOneBase,
    patchOne = patchOneBase,
    patchMany = patchManyBase,
    putOne = putOneBase,
    deleteOne = deleteOneBase,
    deleteMany = deleteManyBase,
  } = methods;
  const router = express.Router();

  router.get('/:contentType', getMany);

  router.get('/:contentType/:itemId', getOne);

  router.patch('/:contentType/:itemId', patchOne);

  router.patch('/:contentType', patchMany);

  router.put('/:contentType', putOne);

  router.delete('/:contentType/:itemId', deleteOne);

  router.delete('/:contentType', deleteMany);

  return router;
};
