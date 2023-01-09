#! /usr/bin/env node

const path = require('path');
// const packageJson = require(path.resolve(__dirname, '..', '..', 'package.json'));
const packageJson = require('./package-test.json');
const semver = require('semver');
const Table = require('cli-table');
const request = require('request');

const loadDependencies = async () => {
  const url = 'https://raw.githubusercontent.com/ffernandomoraes/check-dependencies/master/dependencies.json';

  return await new Promise((resolve, reject) => {
    request(url, { json: true }, (error, res, body) => {
      if (error) reject(error);
      if (!error && res.statusCode === 200) resolve(body);
    });
  });
}

const cleanVersion = (version) => semver.clean(version, { loose: true, includePrerelease: true }) || semver.valid(semver.coerce(version));

const validateCriticalDependencies = (dependencies, criticalDependencies, table) => {
  dependencies.forEach(([name, version]) => {
    const criticalMessage = criticalDependencies[name];

    if (criticalMessage) {
      table.push([name, version, criticalMessage]);
    }
  });
};

const validateMinVersionDependencies = (dependencies, minVersionDependencies, table) => {
  dependencies.forEach(([name, version]) => {
    const minVersion = minVersionDependencies[name];

    if (minVersion) {
      const acceptableVersion = cleanVersion(minVersion);
      const currentVersion = cleanVersion(version);

      if (semver.gt(acceptableVersion, currentVersion)) {
        table.push([name, version, minVersion]);
      }
    }
  });
};

async function init() {
  if (!packageJson) {
    throw 'Não foi possível encontrar o arquivo package.json';
    process.exit(1);
  }

  const criticalTable = new Table({ head: ['Dependência crítica', 'Versão atual', 'Observação'] });
  const minVersionTable = new Table({ head: ['Dependência', 'Versão atual', 'Versão min. aceitável'], style: { head: ['blue'] }});

  const configDependencies = await loadDependencies();
  const projectDependencies = [...Object.entries(packageJson.dependencies), [...Object.entries(packageJson.devDependencies)]];

  const currentValidationConfigDeps = configDependencies['front'];
  const criticalDependencies = currentValidationConfigDeps['critical'];
  const minVersionDependencies = currentValidationConfigDeps['libraries'];

  validateCriticalDependencies(projectDependencies, criticalDependencies, criticalTable);
  validateMinVersionDependencies(projectDependencies, minVersionDependencies, minVersionTable);

  console.log(criticalTable.toString());
  console.log(minVersionTable.toString());
}

init();
