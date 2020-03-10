const express = require('express');

module.exports = db => {
  const router = express.Router();

  router.get('/:contentType/list', (req, res) => {
    const { contentType } = req.params;
    const items = db.get(contentType).value() || [];
    res.setHeader('Access-Control-Expose-Headers', 'X-Total-Count');
    res.setHeader('X-Total-Count', items.length);
    res.send({ data: items, total: items.length });
  });

  router.get('/:contentType/:item/reference', (req, res) => {
    res.status(501).end();
  });

  router.get('/:contentType/:item', async (req, res) => {
    const { item, contentType } = req.params;
    const data = (await db.read())
      .get(contentType)
      .find({ id: Number(item) })
      .value();
    res.send({ data });
  });

  router.get('/:contentType', (req, res) => {
    const { contentType } = req.params;
    const { ids } = req.query;
    const items = db
      .get(contentType)
      .filter(e => ids.include(e.id))
      .value();
    res.send(items);
  });

  router.patch('/:contentType/:item', (req, res) => {
    const { item, contentType } = req.params;
    const params = req.body;

    db.get(contentType)
      .find({ id: Number(item) })
      .assign(params)
      .write();

    const newValue = db.get(contentType, item).value();
    res.status(200).send({ data: newValue });
  });

  router.patch('/:contentType', (req, res) => {
    const { contentType } = req.params;
    const params = req.body;
    const { ids } = req.query;

    db.get(contentType)
      .filter(e => ids.include(e.id))
      .assign(params) // TODO:  test assign to multiple values
      .write();

    res.status(200).end();
  });

  router.put('/:contentType', async (req, res) => {
    const { contentType } = req.params;
    const id =
      db
        .get(contentType)
        .last()
        .value().id + 1;
    const data = { ...req.body.data, id };

    await db
      .get(contentType)
      .push(data)
      .write();
    res.send({ data });
  });

  router.delete('/:contentType/:item', async (req, res) => {
    const { item, contentType } = req.params;
    await db
      .get(contentType)
      .remove({ id: Number(item) })
      .write();
    res.send({ data: {} });
  });

  router.delete('/:contentType', (req, res) => {
    const { contentType } = req.params;
    const ids = req.body;

    ids.forEach(id => {
      db.get(contentType)
        .remove({ id: Number(id) })
        .write();
    });

    res.send({ data: {} });
  });

  return router;
};
