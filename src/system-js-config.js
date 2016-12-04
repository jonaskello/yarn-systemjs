function buildSystemJsPackagesSection(registry) {

    const packagesSection = {};
    for (const packageKey of Object.keys(registry)) {
        const registryPackage = registry[packageKey];
        const split = packageKey.split("@");
        const packageName = split[0];
        const packageVersion = split[1];
        const sectionKey = `nm:${packageName}`;

        packagesSection[sectionKey] = {};

        if (registryPackage.dependencies) {
            packagesSection[sectionKey].map = buildSystemJsDependeciesMap(registryPackage);
        }

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
    buildSystemJsPackagesSection,
    buildSystemJsMapSection,
};