/**
 * Config responsible for building Walkontable test files (bundled into `src/3rdparty/walkontable/test/dist/`):
 *  - specs.entry.js
 *  - helpers.entry.js
 */
const path = require('path');
const webpack = require('webpack');
const fsExtra = require('fs-extra');
const JasmineHtml = require('./plugin/jasmine-html');

const wotPath = path.resolve(__dirname, '../src/3rdparty/walkontable');

module.exports.create = function create(envArgs) {
  const config = {
    target: 'web',
    mode: 'none',
    devtool: 'cheap-module-source-map',
    output: {
      filename: '[name].entry.js',
      globalObject: `typeof self !== 'undefined' ? self : this`,
      libraryTarget: 'var',
      path: path.resolve(wotPath, 'test/dist'),
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          loader: 'babel-loader',
          exclude: [
            /node_modules/,
          ],
          options: {
            cacheDirectory: true,
          },
        }
      ]
    },
    externals: [
      {
        window: 'window',
      },
    ],
    plugins: [
      // This helps ensure the builds are consistent if source code hasn't changed
      new webpack.optimize.OccurrenceOrderPlugin(),
      new JasmineHtml({
        filename: path.resolve(wotPath, 'test/SpecRunner.html'),
        baseJasminePath: `${
          fsExtra.pathExistsSync(
            path.resolve(__dirname, '../node_modules/jasmine-core')
          ) ? '../../../../' : '../../../../../'
        }`,
        externalCssFiles: [
          '../css/walkontable.css',
          '../css/walkontable.test.css',
        ],
        externalJsFiles: [
          'helpers/jasmine-bridge-reporter.js',
          'lib/jquery.min.js',
          'lib/jquery.simulate.js',
          '../dist/walkontable.js',
        ],
      }),
      new webpack.DefinePlugin({
        '__ENV_ARGS__': JSON.stringify(envArgs),
      }),
    ],
  };

  return [].concat(config);
}
