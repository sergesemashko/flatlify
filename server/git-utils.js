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
  console.log(root);
  const status = await isoGit.statusMatrix({ dir: root || './', pattern: '**/*' });
  console.log(paths);

  const modifiedFiles = status
    .filter(row => paths.indexOf(row[0]) !== -1)
    .filter(row => row[HEAD] !== row[WORKDIR] || row[HEAD] !== row[STAGE])
    .map(row => ({ id: row[0], filepath: row[0], statusCodes: row.slice(1) }));

  console.log(modifiedFiles);
  // const paths = await globby([pattern], { gitignore: true });
  // console.log(paths, paths.join("|"));
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
  // console.log(statuses, unstagedFiles );
  return modifiedFiles;
}

// git reset multiple files
async function checkout(branch, pattern = null) {
  await git.checkout({ dir: root, ref: branch, pattern });
  console.log('done');
  return branch;
}

// git commit multiple files
async function commit(files, message, author = {}) {
  for (let filepath in files) {
    await git.add({ dir: root, filepath });
  }

  let sha = await git.commit({
    dir: root,
    author: {
      name: author.name || undefined,
      email: author.email || undefined,
    },
    message,
  });
  console.log(sha);
  return sha;
}

// git current branch

async function branch() {
  let branch = await git.currentBranch({ dir: root, fullname: false });
  console.log(branch);

  return branch;
}

// git show content difference

module.exports = {
  status,
  branch,
  commit,
  checkout,
};
