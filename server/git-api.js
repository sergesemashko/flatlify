const gitUtils = require('./git-utils');
const orderBy = require('lodash/orderBy');
const slice = require('lodash/slice');

function registerGitAPI(server, root) {
  server.get('/modified-files', async (req, res) => {
    console.log(req.query);
    // { _end: '10', _order: 'ASC', _sort: 'id', _start: '0' };
    const _start = req.query._start || 0;
    const _end = req.query._end || 25;
    const _order = req.query._order || 'ASC';
    const _sort = req.query._sort || 'id';

    const files = await gitUtils.status({ root, pattern: req.params.pattern });
    const results = slice(orderBy(files, [_sort], [_order]), _start, _end);
    res.status(200);
    res.header('X-Total-Count', files.length);
    res.send(JSON.stringify(results));
  });

  server.put('/modified-files', async (req, res) => {
    console.log(req.body);
    console.log(req.params);
    console.log(req.query);
    try {
      console.log(req.body && Array.isArray(req.body.ids) && req.body.data && req.body.data.gitAction === 'commit');
      if (req.body && Array.isArray(req.body.ids) && req.body.data && req.body.data.gitAction === 'commit') {
        const message = req.body.message || '';
        const sha = await gitUtils.commit(req.body.ids, { root, message });
      }
    } catch (e) {
      console.error(e);
    }

    const files = await gitUtils.status({ root, pattern: req.params.pattern });
    const _start = req.query._start || 0;
    const _end = req.query._end || 25;
    const _order = req.query._order || 'ASC';
    const _sort = req.query._sort || 'id';
    const results = slice(orderBy(files, [_sort], [_order]), _start, _end);
    res.status(200);
    res.header('X-Total-Count', files.length);
    res.send(JSON.stringify(results));
  });
}

module.exports = {
  registerGitAPI,
};
