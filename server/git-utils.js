const path = require('path');

const isoGit = require('isomorphic-git');
const fs = require('fs');
isoGit.plugins.set('fs', fs);
const HEAD = 1,
  WORK_DIR = 2,
  STAGE = 3;
const globby = require('globby');

function checkModified(row) {
  const workDirStageDifferent = row[HEAD] !== row[WORK_DIR] || row[HEAD] !== row[STAGE];
  return workDirStageDifferent;
}

// git list changed newly added files
async function status({ root, pattern = `server/db/**/*` } = {}) {
  const paths = await globby([pattern], { cwd: root, gitignore: true });
  const status = await isoGit.statusMatrix({ dir: root || './', pattern: '**/*' });
  const modifiedFiles = status
    .filter(row => paths.indexOf(row[0]) !== -1)
    .filter(checkModified)
    .map(row => ({ id: encodeURIComponent(row[0]), filepath: row[0], statusCodes: row.slice(1) }));

  return modifiedFiles;
}

// git reset multiple files
async function checkout(branch, pattern = null, root) {
  await isoGit.checkout({ dir: root, ref: branch, pattern });
  return branch;
}

// git commit multiple files
async function commit(
  filePaths = [],
  {
    message,
    gitRepositoryRoot = path.resolve(__dirname, '..'),
    author = {
      name: 'flatlify',
      email: 'email',
    },
    remove = false,
  } = {},
) {
  const gitAddPromises = filePaths.map(async filepath => {
    const relativeFilePath = path.relative(gitRepositoryRoot, filepath);

    if (!remove) {
      await isoGit.add({ dir: gitRepositoryRoot, filepath: relativeFilePath });
    } else {
      await isoGit.remove({ dir: gitRepositoryRoot, filepath: relativeFilePath });
    }
  });

  await Promise.all(gitAddPromises);

  let sha = await isoGit.commit({
    dir: gitRepositoryRoot,
    author: {
      name: author.name,
      email: author.email,
    },
    message,
  });
  return sha;
}

// git current branch

async function branch(root) {
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
