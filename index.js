#!/usr/bin/env node

const csv = require('csvtojson');
const fs = require('fs');
const { parse } = require('browserslist-ga/src/caniuse-parser');
const args = require('yargs').argv

const browserslistGaEntries = [];
const defaults = {
  ignoreRows: 7,
  outputPath: 'browserslist-stats.json',
  reportPath: null,
};
const settings = Object.assign({}, defaults, args);

let error = false;

if (typeof settings.ignoreRows !== 'number') {
  console.error(new TypeError('browserslist-ga-export: ignoreRows must be a number.'));
  error = true;
}

if (typeof settings.outputPath !== 'string') {
  console.error(new TypeError('browserslist-ga-export: outputPath must be a string.'));
  error = true;
}

if (typeof settings.reportPath !== 'string') {
  console.error(new TypeError('browserslist-ga-export: reportPath must be a string.'));
  error = true;
}

if (error === true) {
  process.exit(1);
}

csv({
  noheader: true
})
  .fromFile(settings.reportPath)
  .on('error', (err) => {
    console.error(err);
    process.exit(1);
  })
  .on('end_parsed', (rows) => {
    // Convert row objects into row arrays expected by parse method
    rows.forEach((row, i) => {
      if (i >= settings.ignoreRows) {
        const rowArray = [];

        for (let i = 0; i <= 5; i++) {
          rowArray[i] = row['field' + (i + 1)];
        }

        // Strip commas and space delimiters from page views string,
        // otherwise conversion to number in parse method will not work as expected
        rowArray[5] = rowArray[5].replace(/,| /, '');

        // Add trailing decimal point and 0 to version number string, otherwise getSubVersion in parse method will not work as expected
        rowArray[3] = rowArray[3] + ".0";

        browserslistGaEntries.push(rowArray);
      }
    });

    try {
      let update = false;

      if (fs.existsSync(settings.outputPath)) {
        update = true;
      }
      fs.writeFileSync(settings.outputPath, JSON.stringify(parse(browserslistGaEntries), null, 2));
      console.log(`browserslist-ga-export: ${settings.outputPath} has been ` + (update ? 'updated' : 'created') + `.`);
      process.exit();
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  });
