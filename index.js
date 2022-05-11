#!/usr/bin/env node

const csv = require('csvtojson');
const fs = require('fs');
const { parse } = require('browserslist-ga/src/caniuse-parser');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const glob = require('fast-glob');

const args = yargs(hideBin(process.argv))
  .option('ignoreRows', {
    alias: 'i',
    type: 'number',
    description: 'Number of rows at beginning of report CSV file(s) to exclude from processing. Default value is based on the default format of Google Analytics custom report CSV exports',
    default: 7
  })
  .option('outputPath', {
    alias: 'o',
    type: 'string',
    description: 'Output path for generated custom usage data file',
    default: 'browserslist-stats.json'
  })
  .option('reportPath', {
    alias: 'r',
    type: 'string',
    description: 'Path or [glob](https://www.npmjs.com/package/fast-glob) path pattern of report CSV file(s) to process',
    demandOption: true
  })
  .argv

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

const getAllFilePaths = (pattern) => glob(pattern);

const getFileRows = (path) => 
  csv({
    noheader: true
  })
    /**
     * Prevent empty rows from being skipped by csvtojson so that ignoreRows
     * option works as expected
     * See https://github.com/browserslist/browserslist-ga-export/issues/12
     */
    .preFileLine(row => row === '' ? ' ' : row)
    .fromFile(path);

const getAllFileRows = (paths) => {
  if (paths.length === 0) {
    throw new Error('No input reportPath files found.');
  }
  return Promise.all(paths.map(getFileRows));
}

const filterAllFileRows = (allFileRows) => allFileRows
  .map((fileRows) => fileRows.filter((row, i) => i >= args.ignoreRows));

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
    if (i === headers.indexOf('browserVersion') && value.indexOf('.') === -1) {
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
  .reduce((combined, fileRows) => combined.concat(fileRows), []);

const outputJson = (rows) => {
  const isUpdate = fs.existsSync(args.outputPath);

  fs.writeFileSync(args.outputPath, JSON.stringify(parse(rows), null, 2));
  console.log(`browserslist-ga-export: ${args.outputPath} has been ${isUpdate ? 'updated' : 'created'}.`);
  process.exit();
};

getAllFilePaths(args.reportPath)
  .then(getAllFileRows)
  .then(filterAllFileRows)
  .then(convertAllFileRows)
  .then(concatAllFileRows)
  .then(outputJson)
  .catch(handleError);
