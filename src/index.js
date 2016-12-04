/**
 * The lockfile.cache has entries like this:
 * {
 *   'packageA@^1.0.0': {
 *     version: '1.0.10',
 *     resolved: 'https://registry.yarnpkg.com/packageA/-/packageA-1.0.10.tgz#...',
 *     dependencies: {
 *       'packageB': '^4.1.2'
 *     }
 *   },
 *   'packagB@^4.1.2': {
 *     version: '4.1.5',
 *     resolved: 'https://registry.yarnpkg.com/packagB/-/packagB-4.1.2.tgz#...',
 *   }
 * }
 *
 * We transform it to an internal representation like this
 * {
 *   "packageA@1.0.10": {
 *     "location": "expected location on disk calculated from deterministic algorithm",
 *     "dependencies": {
 *       "packagB": "packagB@4.1.5"
 *     }
 *   },
 *   "packageB@4.1.5": {
 *     "location": "expected location on disk calculated from deterministic algorithm",
 *   }
 * }
 *
 * Then we write it out to SystemJS config.
 * {
 *   "paths": {
 *     "nm:": "node_modules/"
 *   },
 *   "map": {
 *     "packageA": "nm:PackageA",
 *     "packageB": "nm:PackageB",
 *   },
 *   "packages": {
 *     "packageA": {
 *       "map": {
 *         "packageB": "nm:PackageB"
 *       }
 *     },
 *     "packageB": {
 *     },
 *   }
 * }
 */

const LockFile = require('yarn/lib/lockfile/wrapper.js').default;
const {convertPackage} = require('jspm-npm/lib/node-conversion');
const Registry = require('./registry');
const SystemJsConfig = require('./system-js-config');

LockFile.fromDirectory("./").then(handleLockfile).catch((e) => console.log(e));

function handleLockfile(lockfile) {

    // exports.convertPackage = function(packageConfig, packageName, packageDir, ui) {

    const registry = Registry.lockfileToRegistry(lockfile);
    const configs = buildSystemJsPackageJsonExtensions(registry);

    // Build the final systemjs config
    const systemjsconfig = {
        map: SystemJsConfig.buildSystemJsMapSection(registry),
        packages: SystemJsConfig.buildSystemJsPackagesSection(registry),
    };
    console.log(JSON.stringify(systemjsconfig, undefined, 2));

}

/**
 * Builds SystemJS config for each package in the given registry
 */
function buildSystemJsPackageJsonExtensions(registry) {

    // convertPackage(depMap.config, ':' + key, './' + depMap.location, console)
    //     .then(config => Object.assign(depMap, {config, augmented: true}))
    //     .catch(log)

    return {};
}



