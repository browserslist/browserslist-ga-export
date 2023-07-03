# browserslist-ga-export

## Overview

`browserslist-ga-export` allows you to generate a `browserslist-stats.json` file for Google Analytics data using the [Browserslist-GA](https://github.com/browserslist/browserslist-ga) parser without requiring you to log into a Google Account. Instead of logging into a Google Account, you must provide a CSV export of Google Analytics data.

## Installation

```bash
npm install browserslist-ga-export --save-dev
```

## Usage

### Google Analytics 4

#### 1) Create exploration

Create a blank [Exploration](https://support.google.com/analytics/answer/7579450) with the specifications listed below:

  - **Date range**: Desired date range
  - **Dimensions**:
    1. Operating system
    2. OS version
    3. Browser
    4. Browser version
    5. Device category
  - **Metrics**: Views
  - **Rows** (in this order):
    1. Operating system
    2. OS version
    3. Browser
    4. Browser version
    5. Device category
  - **Values**: Views

#### 2) Export exploration CSV

Press the Export Data button and select the CSV option.

#### 3) Generate `browserslist-stats.json`

Use the `browserslist-ga-export` CLI to generate a `browserslist-stats.json` file based on the CSV file. See [CLI documentation](#cli) for more details.

```bash
browserslist-ga-export --reportPath {String} [options]
```

### Universal Analytics

#### 1) Check user language setting

Ensure that language is set to "English (United States)" in [user language settings](https://support.google.com/analytics/answer/3210078?hl=en). See [#5](https://github.com/browserslist/browserslist-ga-export/pull/5) and [#14](https://github.com/browserslist/browserslist-ga-export/issues/14) for an explanation of why this is necessary.

#### 2) Create custom report

[Create a custom report](https://support.google.com/analytics/answer/1151300?hl=en) with the specifications listed below. You will be able to use this custom report for one or more desired [Google Analytics view(s)](https://support.google.com/analytics/answer/2649553?hl=en) associated with a [Google Analytics account](https://support.google.com/analytics/topic/1009690?hl=en&ref_topic=1726911).

  - **Type**: Flat Table
  - **Dimensions** (in this order):
    1. Operating System
    2. Operating System Version
    3. Browser
    4. Browser Version
    5. Device Category
  - **Metrics**: Pageviews

#### 3) Export custom report CSV file(s)

For each desired view, follow these steps to export the custom report as a CSV file:

1. View the custom report.
2. Sort the report by Browser column ascending alphabetically (arrow in column header facing up).
3. Select the desired date range for the report.
4. Show 5000 rows for the report.
5. [Export the report as a CSV file](https://support.google.com/analytics/answer/1038573?hl=en).
6. If your report has more than 5,000 rows, you must export each page of the report individually.

#### 4) Generate `browserslist-stats.json` file based on CSV file(s)

Use the browserslist-ga-export CLI to generate a `browserslist-stats.json` file based on the CSV file(s). See [CLI documentation](#cli) for more details.

```bash
browserslist-ga-export --reportPath {String} --firstRowIndex 7 [options]
```

## CLI

### `browserslist-ga-export`

Generate a `browserslist-stats.json` file based on one or more Google Analytics data CSV files (see [usage instructions](#usage)).

#### Options

##### `--reportPath` (`-r`)

Path or [glob](https://www.npmjs.com/package/fast-glob) path pattern of CSV file(s) to process. If a glob path pattern is provided that resolves to multiple files, the `browserslist-stats.json` file will represent the merged data of those files.

- Required
- Type: string

##### `--firstRowIndex` (`-f`)

Zero-based index of first data row in CSV file. Default value is based on the default format of Google Analytics 4 CSV exports.

- Optional
- Type: number
- Default: `8`

##### `--outputPath` (`-o`)

Output path for generated `browserslist-stats.json` file. If a file already exists at the path, that file will be overwritten.

- Optional
- Type: string
- Default: `'browserslist-stats.json'`

#### Examples

Generate `browserslist-stats.json` from a Google Analytics 4 CSV file called `browserslist-report.csv`:

```bash
browserslist-ga-export --reportPath browserslist-report.csv
```

Generate `browserslist-stats.json` from a Universal Analytics CSV file called `browserslist-report.csv`:

```bash
browserslist-ga-export --reportPath browserslist-report.csv --firstRowIndex 7
```

Generate `browserslist-stats.json` from multiple CSV files in a folder called `browserslist-reports`:

```bash
browserslist-ga-export -r browserslist-reports/*.csv
```

Generate custom usage data file called `browser-stats.json` instead of `browserslist-stats.json`:

```bash
browserslist-ga-export -r browserslist-report.csv -o browser-stats.json
```
