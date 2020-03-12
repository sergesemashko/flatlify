const express = require('express');
const path = require('path');
const utils = require('./utils');

module.exports = () => {
  const router = express.Router();

  router.get('/:contentType', async (req, res) => {
    const { contentType } = req.params;
    const { ids } = req.query;

    const contentPath = path.resolve('db', `${contentType}.json`);
    const items = await utils.read(contentPath);
    const data = items.filter(item => ids.includes(Number(item.id)));

    res.send({ data });
  });

  router.get('/:contentType/list', async (req, res) => {
    const { contentType } = req.params;

    const contentPath = path.resolve('db', `${contentType}.json`);
    const items = await utils.read(contentPath);

    res.setHeader('Access-Control-Expose-Headers', 'X-Total-Count');
    res.setHeader('X-Total-Count', items.length);
    res.send({ data: items, total: items.length });
  });

  router.get('/:contentType/:itemId', async (req, res) => {
    const { itemId, contentType } = req.params;

    const contentPath = path.resolve('db', `${contentType}.json`);
    const items = await utils.read(contentPath);
    const data = items.find(item => item.id === Number(itemId));

    res.send({ data });
  });

  router.patch('/:contentType/:itemId', async (req, res) => {
    const { itemId, contentType } = req.params;
    const params = req.body;

    const contentPath = path.resolve('db', `${contentType}.json`);
    const items = await utils.read(contentPath);
    const itemIndex = items.findIndex(item => item.id === Number(itemId));

    items[itemIndex] = { ...items[itemIndex], ...params };

    await utils.save(contentPath, items);

    res.status(200).send({ data: items[itemIndex] });
  });

  router.patch('/:contentType', async (req, res) => {
    const { contentType } = req.params;
    const params = req.body;
    const { ids } = req.query;

    const contentPath = path.resolve('db', `${contentType}.json`);
    const items = await utils.read(contentPath);
    items.forEach((item, index) => {
      if (ids.includes(item.id)) {
        items[index] = { ...items[index], ...params };
      }
    });

    await utils.save(contentPath, items);

    res.status(200).send({ data: ids });
  });

  router.put('/:contentType', async (req, res) => {
    const { contentType } = req.params;

    const contentPath = path.resolve('db', `${contentType}.json`);
    const items = await utils.read(contentPath);
    const newId = items.length ? items[items.length - 1].id + 1 : 0;

    const newContentType = { ...req.body.data, id: newId };

    const newItems = [...items, newContentType];
    const itemPath = path.resolve('db', `${req.body.data.type}.json`);

    await Promise.all([utils.save(contentPath, newItems), utils.save(itemPath, [])]);

    res.send(newContentType);
  });

  router.delete('/:contentType/:itemId', async (req, res) => {
    const { contentType, itemId } = req.params;

    const contentPath = path.resolve('db', `${contentType}.json`);

    const items = await utils.read(contentPath);
    const newItems = items.filter(item => item.id !== Number(itemId));
    const itemType = items.find(item => item.id === Number(itemId)).type;

    const itemPath = path.resolve('db', `${itemType}.json`);

    await Promise.all([utils.save(contentPath, newItems), utils.remove(itemPath)]);

    res.send({ data: {} });
  });

  router.delete('/:contentType', async (req, res) => {
    const { contentType } = req.params;
    const ids = req.body;

    const contentPath = path.resolve('db', `${contentType}.json`);

    const items = await utils.read(contentPath);
    const newItems = items.filter(item => !ids.includes(Number(item.id)));
    const removedContentTypes = items
      .filter(item => ids.includes(Number(item.id)))
      .map(item => item.type);

    const removedContentTypePromises = removedContentTypes.map(removedContentType => {
      const contentTypePath = path.resolve('db', `${removedContentType}.json`);
      return utils.remove(contentTypePath);
    });

    await Promise.all([utils.save(contentPath, newItems), removedContentTypePromises]);

    res.send({ data: {} });
  });

  return router;
};
