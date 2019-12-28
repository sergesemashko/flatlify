const gitUtils = require('./git-utils');

function registerGitAPI(server, root) {
  server.get('/modified-files', async (req, res) => {
    console.log(req.query);
    // { _end: '10', _order: 'ASC', _sort: 'id', _start: '0' };
    const files = await gitUtils.status({ root, pattern: req.params.pattern });
    res.status(200);
    res.header('X-Total-Count', files.length);
    res.send(JSON.stringify(files));
  });
}

module.exports = {
  registerGitAPI,
};
