#! /usr/bin/env node

const path = require('path');
// const packageJson = require(path.resolve(__dirname, '..', '..', 'package.json'));
const packageJson = require('./package-test.json');
const semver = require('semver');

const projectDependencies = Object.entries(packageJson.dependencies);
const projectDevDependencies = Object.entries(packageJson.devDependencies);
const args = process.argv && process.argv.slice(2) || [];

const frontCriticalDependencies = {};
const frontMinVersionDependencies = {};

const cleanVersion = (version) => semver.clean(version, { loose: true, includePrerelease: true }) || semver.valid(semver.coerce(version));

const validateCriticalDependencies = (dependencies, criticalDependencies) => {
  const errors = [];

  dependencies.forEach(([name]) => {
    const criticalMessage = criticalDependencies[name];

    if (criticalMessage) {
      errors.push(`[${name}]: ${criticalMessage}`);
    }
  });

  return errors;
};

const validateVersionDependencies = (dependencies, minVersionDependencies) => {
  const warnings = [];

  dependencies.forEach(([name, version]) => {
    const minVersion = minVersionDependencies[name];

    if (minVersion) {
      const acceptableVersion = cleanVersion(minVersion);
      const currentVersion = cleanVersion(version);

      if (semver.gt(acceptableVersion, currentVersion)) {
        warnings.push(`[${name}] versão atual: ${version}. Versão mínima aceitável: ${minVersion}`);
      }
    }
  });

  return warnings;
};

console.log(validateCriticalDependencies([...projectDependencies, ...projectDevDependencies], frontCriticalDependencies));
console.log(validateVersionDependencies([...projectDependencies, ...projectDevDependencies], frontMinVersionDependencies));
