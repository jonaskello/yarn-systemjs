/**
 * Transforms a yarn lockfile to internal registry object.
 * @param lockfile - The yarn lockfile
 * @returns Registry - The internal registry
 */
function lockfileToRegistry(lockfile) {

    const registry = {};
    for (const packageKey of Object.keys(lockfile.cache)) {
        const lockfilePackage = lockfile.cache[packageKey];
        const split = packageKey.split("@");
        const packageName = split[0];
        const versionRange = split[1];
        const registryKey = `${packageName}@${lockfilePackage.version}`;
        registry[registryKey] = {
            location: calculatePackageLocation(lockfilePackage, lockfile),
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
        const versionRange = dependencies[packageName];
        resolved[packageName] = rangeToExactVersion(lockfile, packageName, versionRange);
    }
    return resolved;
}

function rangeToExactVersion(lockfile, packageName, versionRange) {
    const findKey = `${packageName}@${versionRange}`;
    for (const packageKey of Object.keys(lockfile.cache)) {
        if (packageKey === findKey) {
            return lockfile.cache[packageKey].version;
        }
    }
    throw new Error("NOT FOUND");
}

function calculatePackageLocation(package, lockfile) {
    // TODO: This has to be done smarter to account for private nodule_modules folders
    // Yarn probably has a determenistic way of calculating who should get private node_mdoules folder
    // but what is the algorithm for that?
    return "./node_modules";
}

module.exports = {
    lockfileToRegistry
};
