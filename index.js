#!/usr/bin/env node

const csv = require('csvtojson');
const fs = require('fs');
const { parse } = require('browserslist-ga/src/caniuse-parser');
const args = require('yargs').argv;
const glob = require('glob');

const defaults = {
  ignoreRows: 7,
  outputPath: 'browserslist-stats.json',
  reportPath: null,
};
const settings = Object.assign({}, defaults, args);

let error = false;

if (typeof settings.ignoreRows !== 'number') {
  console.error(
    new TypeError('browserslist-ga-export: ignoreRows must be a number.')
  );
  error = true;
}

if (typeof settings.outputPath !== 'string') {
  console.error(
    new TypeError('browserslist-ga-export: outputPath must be a string.')
  );
  error = true;
}

if (typeof settings.reportPath !== 'string') {
  console.error(
    new TypeError('browserslist-ga-export: reportPath must be a string.')
  );
  error = true;
}

if (error === true) {
  process.exit(1);
}

const headers = [
  'os',
  'osVersion',
  'browser',
  'browserVersion',
  'deviceCategory',
  'pageViews'
];

const handleError = (err) => {
  console.error(err);
  process.exit(1);  
};

const getAllFilePaths = (pattern) => new Promise((resolve) => {
  glob(pattern, (err, files) => {
    resolve(files);
  });
});

const getFileRows = (path) => new Promise((resolve) => {
  csv({
    noheader: true
  })
    .fromFile(path)
    .on('error', handleError)
    .on('end_parsed', resolve);
});

const getAllFileRows = (paths) => Promise.all(paths.map(getFileRows));

const filterAllFileRows = (allFileRows) => allFileRows
  .map((fileRows) => fileRows.filter((row, i) => i >= settings.ignoreRows));

/**
 * Convert array of row objects returned by csvtojson into row arrays expected
 * by browserslist-ga parse method
 */
const convertFileRows = (rows) => rows
  .map((row) => headers.map((header, i) => {
    let value = row[`field${i + 1}`];

    /**
     * Add trailing decimal point and 0 to browser version number string,
     * otherwise getSubVersion in parse method will not work as expected
     */
    if (i === headers.indexOf('browserVersion')) {
      value = `${value}.0`;
    }

    /**
     * Strip commas from page views string, otherwise conversion to number in
     * parse method will not work as expected
     */
    if (i === headers.indexOf('pageViews')) {
      value = value.split(',').join('');
    }

    return value;
  }));

const convertAllFileRows = (allFileRows) => allFileRows.map(convertFileRows);

const concatAllFileRows = (allFileRows) => allFileRows
  .reduce((combined, fileRows) => combined.concat(fileRows));

const outputJson = (rows) => {
  try {
    const isUpdate = fs.existsSync(settings.outputPath);

    fs.writeFileSync(settings.outputPath, JSON.stringify(parse(rows), null, 2));
    console.log(`browserslist-ga-export: ${settings.outputPath} has been ${isUpdate ? 'updated' : 'created'}.`);
    process.exit();
  } catch (err) {
    handleError(err);
  }
};

getAllFilePaths(settings.reportPath)
  .then(getAllFileRows)
  .then(filterAllFileRows)
  .then(convertAllFileRows)
  .then(concatAllFileRows)
  .then(outputJson);
