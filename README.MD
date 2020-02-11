# browserslist-ga-export
Generate `browserslist-stats.json` using [Browserslist-GA](https://github.com/browserslist/browserslist-ga) without logging into a Google Account.

browserslist-ga-export allows you to generate the same `browserslist-stats.json` that Browserslist-GA would generate for a Google Analytics view without requiring you to log into a Google Account. Instead of logging into a Google Account, you must provide a CSV export of a [Google Analytics custom report](https://support.google.com/analytics/answer/1151300?hl=en).

## Installation

If you are using npm:

```
$ npm install --save-dev browserslist-ga-export
```

If you are using Yarn:

```
$ yarn add --dev browserslist-ga-export
```

## Usage

### 1) Export custom report as CSV

1. [Create a custom report](https://support.google.com/analytics/answer/1151300?hl=en) for the desired [Google Analytics view](https://support.google.com/analytics/answer/2649553?hl=en) using the format below. **Note**: The language you see in Google Analytics may vary depending on your user language settings.
    - **Type**: Flat Table
    - **Dimensions** (in this order): Operating System, Operating System Version, Browser, Browser Version, Device Type
    - **Metrics**: Pageviews or Page Views
2. View the report.
3. Sort the report by Browser ascending.
4. Select the desired date range for the report.
5. Show 5000 rows for the report.
6. [Export the report as a CSV](https://support.google.com/analytics/answer/1038573?hl=en).

### 2) Convert CSV into `browserslist-stats.json`

If you are using npm v5.2.0 or higher:

```
$ npx browserslist-ga-export --reportPath {path-to-export}.csv
```

If you are using Yarn:

```
$ yarn browserslist-ga-export --reportPath {path-to-export}.csv
```

You can also add a script to package.json, for example:

```
"scripts": {
  "update-browserslist-stats": "browserslist-ga-export --reportPath {path-to-export}.csv"
}
```

### 3) [Query against your custom usage data](https://github.com/browserslist/browserslist#custom-usage-data)

## CLI Options

|Name|Type|Default|Description|
|:--:|:--:|:-----:|:----------|
|**`ignoreRows`**|`{Number}`|`7`|Number of rows at beginning of CSV file to exclude from data passed to Browserslist-GA. The default value is based on the default format of Google Analytics custom report CSV exports.|
|**`outputPath`** |`{String}`|`'browserslist-stats.json'`|Path for exported browserslist-stats file.|
|**`reportPath`**|`{String}`|`null`|Path of report CSV to process.|
