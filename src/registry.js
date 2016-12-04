/**
 * Transforms a yarn lockfile to internal registry object.
 * @param lockfile - The yarn lockfile
 * @returns Registry - The internal registry
 */
function lockfileToRegistry(lockfile) {

  const registry = {};
  for (const lockfileKey of Object.keys(lockfile)) {
    const lockfilePackage = lockfile[lockfileKey];
    const split = lockfileKey.split("@");
    const packageName = split[0];
    const versionRange = split[1];
    const registryKey = `${packageName}@${lockfilePackage.version}`;
    registry[registryKey] = {
      location: calculatePackageLocation(packageName, lockfilePackage, lockfile),
    };
    if (lockfilePackage.dependencies) {
      registry[registryKey].dependencies = resolveDependencies(lockfilePackage.dependencies, lockfile);
    }
  }
  return registry;

}

function resolveDependencies(dependencies, lockfile) {
  const resolved = {};
  for (const packageName of Object.keys(dependencies)) {
    let versionRange = dependencies[packageName];
    // VersionRange could actually also be a github specification if it contains a slash
    if (versionRange.indexOf("/") !== -1) {
      versionRange = "github:" + versionRange;
    }
    resolved[packageName] = rangeToExactVersion(lockfile, packageName, versionRange);
  }
  return resolved;
}

function rangeToExactVersion(lockfile, packageName, versionRange) {
  const findKey = `${packageName}@${versionRange}`;
  let package = lockfile[findKey];
  if (!package) {
    // The yarn bug seems fixed in latest nightly
    // // TODO: Maybe a yarn bug but sometimes the lockfile key has no package name part,
    // // eg. like "@github:jspm/nodelibs-assert" instead of "jspm-nodelibs-assert@github:jspm/nodelibs-assert"
    // package = lockfile[`@${versionRange}`];
    // if (!package) {
    throw new Error(`Could not find lockfile package with key ${findKey}`);
    // }
  }
  return package.version;
}

function calculatePackageLocation(packageName, lockfilePackage, lockfile) {
  // TODO: This has to be done smarter to account for private nodule_modules folders
  // Yarn probably has a determenistic way of calculating who should get private node_mdoules folder
  // but what is the algorithm for that?
  return `./node_modules/${packageName}`;
}

module.exports = {
  lockfileToRegistry
};
