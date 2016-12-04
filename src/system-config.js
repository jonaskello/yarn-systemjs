function buildSystemConfig({registry, configs}) {

  // console.log(JSON.stringify(registry, undefined, 2));
  // console.log(JSON.stringify(configs, undefined, 2));

  return {
    paths: {"nm:": "node_modules/"},
    map: buildSystemJsMapSection(registry),
    packages: buildSystemJsPackagesSection(registry, configs),
  };

}

function buildSystemJsPackagesSection(registry, configs) {

  const packagesSection = {};
  for (const registryKey of Object.keys(registry)) {
    const registryPackage = registry[registryKey];
    const split = registryKey.split("@");
    const packageName = split[0];
    const packageVersion = split[1];
    const sectionKey = `nm:${packageName}`;
    const packageConfig = configs[registryKey];
    if (registryPackage.dependencies) {
      const depMap = buildSystemJsDependeciesMap(registryPackage);
      if (packageConfig) {
        Object.assign(packageConfig, {map: depMap});
      }
      else {
        console.log(`Package config not found for ${registryKey}`);
      }
    }
    packagesSection[sectionKey] = packageConfig;

  }
  return packagesSection;

}

function buildSystemJsDependeciesMap(registryPackage) {
  const map = {};
  for (const depKey of Object.keys(registryPackage.dependencies)) {
    map[depKey] = `nm:${depKey}`;
  }
  return map;
}

function buildSystemJsMapSection(registry) {

  const mapSection = {};
  for (const packageKey of Object.keys(registry)) {
    const registryPackage = registry[packageKey];
    const split = packageKey.split("@");
    const packageName = split[0];
    const packageVersion = split[1];
    mapSection[packageName] = `nm:${packageName}`;
  }
  return mapSection;

}

module.exports = {
  buildSystemConfig,
};
