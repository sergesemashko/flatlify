const express = require('express');

module.exports = db => {
  const router = express.Router();

  router.get('/:contentType', (req, res) => {
    const { contentType } = req.params;
    const { ids } = req.query;
    const items = db
      .get(contentType)
      .filter(e => ids.include(e.id))
      .value();
    res.send({ data: items });
  });

  router.get('/:contentType/list', (req, res) => {
    const { contentType } = req.params;
    const items = db.get(contentType).value() || [];
    res.setHeader('Access-Control-Expose-Headers', 'X-Total-Count');
    res.setHeader('X-Total-Count', items.length);
    res.send({ data: items, total: items.length });
  });

  router.get('/:contentType/:item', async (req, res) => {
    const { item, contentType } = req.params;
    const data = (await db.read())
      .get(contentType)
      .find({ id: Number(item) })
      .value();
    res.send({ data });
  });

  router.patch('/:contentType/:item', (req, res) => {
    const { item, contentType } = req.params;
    const params = req.body;
    //TODO: change contentType name
    db.get(contentType)
      .find({ id: Number(item) })
      .assign(params)
      .write();
    const newValue = db.get(contentType, item).value();
    res.status(200).send({ data: newValue });
  });

  router.patch('/:contentType', (req, res) => {
    const { 'content-type': contentType } = req.params;
    const params = req.body;
    const { ids } = req.query;
    db.get(contentType)
      .filter(e => ids.include(e.id))
      .assign(params) // TODO:  test assign to multiple values
      .write();

    res.status(501).end();
  });

  router.put('/:contentType', async (req, res) => {
    const { contentType } = req.params;

    const id = db.get(contentType).value().length;

    const data = { fields: [], ...req.body.data, id };

    await Promise.all([
      db
        .get(contentType)
        .push(data)
        .write(),
      db.set(data.type, []).write(),
    ]);

    res.send({ data });
  });

  router.delete('/:contentType/:item', async (req, res) => {
    const { item, contentType } = req.params;
    const { type } = db
      .get(contentType)
      .find({ id: Number(item) })
      .value();

    await Promise.all([
      db
        .get(contentType)
        .remove({ id: Number(item) })
        .write(),
      db.unset(type).write(),
    ]);
    console.log('hello', contentType, item);
    res.send({ data: {} });
  });

  router.delete('/:contentType', (req, res) => {
    const { 'content-type': contentType } = req.params;
    const { ids } = req.query;

    db.get(contentType)
      .remove(e => ids.include(e.id))
      .write();
    res.status(200).end();
  });

  return router;
};
