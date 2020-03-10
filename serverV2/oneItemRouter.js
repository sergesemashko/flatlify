const express = require('express');

module.exports = db => {
  const router = express.Router();

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

    db.get(contentType)
      .find({ id: Number(item) })
      .assign(params)
      .write();

    const newValue = db.get(contentType, item).value();
    res.status(200).send({ data: newValue });
  });

  router.delete('/:contentType/:item', (req, res) => {
    const { item, contentType } = req.params;

    db.get(contentType)
      .remove({ id: item })
      .write();
  });

  router.get('/:contentType/:item/reference', (req, res) => {
    res.status(501).end();
  });

  return router;
};
