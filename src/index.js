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
 * We transform it to an internal registry like this
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

const LockFile = require("./lockfile");
const Registry = require("./registry");
const SystemConfig = require("./system-config");
const PackageConfig = require("./package-config");
const fs = require("fs");

main("./");

function main(lockFileDirectory) {

  LockFile.parseLockFile(lockFileDirectory)
    .then(Registry.lockfileToRegistry)
    .then((registry) => PackageConfig.buildPackageConfigs(registry)
      .then((configs) => ({registry, configs})))
    .then(SystemConfig.buildSystemConfig)
    .then(writeConfig)
    .catch((e) => console.log(e));
}

function writeConfig(config) {
  fs.writeFileSync("./generated.config.js", `SystemJS.config(${JSON.stringify(config, null, 2)});`);
}


