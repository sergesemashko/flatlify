const isoGit = require('isomorphic-git');
const fs = require('fs');
const path = require('path');
isoGit.plugins.set('fs', fs);
const HEAD = 1,
  WORKDIR = 2,
  STAGE = 3;
const globby = require('globby');

function checkModified(row) {
  const workdirStageDifferent = row[HEAD] !== row[WORKDIR] || row[HEAD] !== row[STAGE];
}

// git list changed newly added files
async function status({ root, pattern = './**/*' } = {}) {
  const paths = await globby([pattern], { cwd: root, gitignore: true });
  const status = await isoGit.statusMatrix({ dir: root || './', pattern: '**/*' });

  const modifiedFiles = status
    .filter(row => paths.indexOf(row[0]) !== -1)
    .filter(row => row[HEAD] !== row[WORKDIR] || row[HEAD] !== row[STAGE])
    .map(row => ({ id: encodeURIComponent(row[0]), filepath: row[0], statusCodes: row.slice(1) }));

  // const paths = await globby([pattern], { gitignore: true });
  // const statuses = await Promise.all(
  //   paths.map(async filepath => {
  //     const status = await isoGit.status({ dir: root, filepath });
  //     return {
  //       status,
  //       filepath
  //     };
  //   })
  // );
  // const unstagedFiles = statuses.filter(fileMeta => fileMeta.status !== 'ignored' && fileMeta.status !== 'unmodified');
  return modifiedFiles;
}

// git reset multiple files
async function checkout(branch, pattern = null) {
  await isoGit.checkout({ dir: root, ref: branch, pattern });
  return branch;
}

// git commit multiple files
async function commit(files, { message, root, author = {} } = {}) {
  for (let i = 0; i < files.length; i++) {
    await isoGit.add({ dir: root || './', filepath: decodeURIComponent(files[i]) });
  }
  let sha = await isoGit.commit({
    dir: root,
    author: {
      name: author.name || undefined,
      email: author.email || undefined,
    },
    message,
  });
  return sha;
}

// git current branch

async function branch() {
  let branch = await isoGit.currentBranch({ dir: root, fullname: false });

  return branch;
}

// git show content difference

module.exports = {
  status,
  branch,
  commit,
  checkout,
};
