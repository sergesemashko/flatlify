const express = require('express');
const { subDays } = require('date-fns');

module.exports = db => {
  const router = express.Router();

  router.get('/:contentType', (req, res) => {
    const { contentType } = req.params;
    const { ids } = req.query;
    const items = db
      .get(contentType)
      .filter(e => ids.include(e.id))
      .value();
    res.send(items);
  });

  router.get('/:contentType/list', (req, res) => {
    const { contentType } = req.params;
    const items = db.get(contentType).value() || [];
    res.setHeader('Access-Control-Expose-Headers', 'X-Total-Count'); //, Link');
    res.setHeader('X-Total-Count', items.length);
    res.send({ data: items, total: items.length });
  });

  router.patch('/:contentType', (req, res) => {
    const { 'content-type': contentType } = req.params;
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

    const id = db.get(contentType).value().length;

    const data = { ...req.body.data, id };

    await db
      .get(contentType)
      .push(data)
      .write();
    res.send({ data });
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
