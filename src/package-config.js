const JspmNodeConversion = require("jspm-npm/lib/node-conversion");
const fs = require("fs");
const path = require("path");

/**
 * Builds extended SystemJS package.json config for each package in the given registry
 */
function buildPackageConfigs(registry) {

  const promises = [];
  for (const registryKey of Object.keys(registry)) {
    const registryPackage = registry[registryKey];
    const split = registryKey.split("@");
    const packageName = split[0];
    const packageVersion = split[1];
    promises.push(
      promiseConfigForPackage(registryPackage.location, registryKey)
        .then((config) => ({registryKey, config})));
  }

  return Promise.all(promises)
    .then((results) => {
      const configs = {};
      for (const result of results) {
        if (result.config) {
          configs[result.registryKey] = result.config;
        }
      }
      return configs;
    });

}

function promiseConfigForPackage(location, key) {

  return promisePackageJson(location)
    .then((packageJson) => jspmConvertPackage(packageJson, ':' + key, location))
    .then((config) => pruneConfigKeys(config))
    .catch((e) => console.log(e));

}

function pruneConfigKeys(config) {
  if (!config)
    return undefined;
  const keep = [
    'meta',
    'map',
    'main',
    'format',
    'defaultExtension',
    'defaultJSExtensions'
  ];
  const result = {};
  for (const key of Object.keys(config)) {
    if (keep.indexOf(key) !== -1) {
      result[key] = config[key];
    }
  }
  return result;
}

function jspmConvertPackage(packageJson, key, location) {

  if (!shouldBuildConfig(packageJson))
    return undefined;

  // exports.convertPackage = function(packageConfig, packageName, packageDir, ui) {
  return JspmNodeConversion.convertPackage(packageJson, key, location, console)
    .catch((e) => console.log(`Failed to convert package.json key: '${key}', location: '${location}', Error: ${e}.`))
}

function promisePackageJson(location) {
  return new Promise((resolve, reject) => {
    const fileName = path.join(location, "package.json");
    fs.readFile(fileName, "utf8", function (err, data) {
      if (err) reject(err);
      try {
        const obj = JSON.parse(data);
        resolve(obj);
      }
      catch (e) {
        console.log(`Error parsing '${fileName}'`);
        throw e;
      }
    });
  });
}

function shouldBuildConfig(packageJson) {

  // Don't augment things that specify config.jspmPackage
  if (packageJson.jspmPackage != undefined && packageJson.jspmPackage) {
    return false;
  }

  // Don't augment things that specify config.jspmNodeConversion == false
  if (packageJson.jspmNodeConversion !== undefined && !packageJson.jspmNodeConversion) {
    return false;
  }

  // Don't augment things that specify config.jspm.jspmNodeConversion == false
  if (packageJson.jspm !== undefined
    && packageJson.jspm.jspmNodeConversion !== undefined
    && !packageJson.jspm.jspmNodeConversion) {
    return false;
  }

  return true;
}

module.exports = {
  buildPackageConfigs,
};
