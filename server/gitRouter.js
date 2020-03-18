const gitUtils = require('./git-utils');
const orderBy = require('lodash/orderBy');
const slice = require('lodash/slice');
const express = require('express');

module.exports = root => {
  const router = express.Router();

  router.get('/modified-files', async (req, res) => {
    const _start = req.query._start || 0;
    const _end = req.query._end || 25;
    const _order = req.query._order || 'ASC';
    const _sort = req.query._sort || 'id';
    const files = await gitUtils.status({ root, pattern: req.query.pattern });
    const results = slice(orderBy(files, [_sort], [_order]), _start, _end);
    res.status(200);
    res.header('X-Total-Count', files.length);
    res.send({ data: results, total: files.length });
  });

  router.patch('/modified-files', async (req, res) => {
    try {
      if (
        req.body &&
        Array.isArray(req.body.ids) &&
        req.body.data &&
        req.body.data.gitAction === 'commit'
      ) {
        const message = req.body.message || '';
        const sha = await gitUtils.commit(req.body.ids, { root, message, author: req.body.author });
      }
    } catch (e) {
      console.error(e);
    }

    const files = await gitUtils.status({ root, pattern: req.params.pattern });
    res.header('X-Total-Count', files.length);
    res.send({ data: req.body.ids });
  });
  return router;
};
