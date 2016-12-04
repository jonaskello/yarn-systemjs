const LockFile = require('yarn/lib/lockfile/wrapper.js').default;

/**
 * Parses a yarn.lockfile and returns an object.
 * @param lockFileDirectory
 * @returns {Promise.<LockFile>}
 */
function parseLockFile(lockFileDirectory) {

  return LockFile
    .fromDirectory(lockFileDirectory)
    .then((lockfile) => lockfile.cache)
    .catch((e) => console.log(e));

}

module.exports = {
  parseLockFile,
};
