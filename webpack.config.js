const ForkTsCheckerPlugin = require('fork-ts-checker-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { resolve } = require('path');
const webpack = require('webpack');

const env = process.env.NODE_ENV || 'development';
const isProd = env === 'production';

const config = {
  mode: env,
  devtool: 'inline-source-map',

  entry: {
    'napari-sphinx-theme': [
      ...(isProd ? [] : ['webpack-hot-middleware/client']),
      './src/napari_sphinx_theme/assets/scripts/index.js',
      './src/napari_sphinx_theme/assets/napari.tsx',
    ],
  },

  output: {
    filename: 'scripts/[name].js',
    path: resolve(
      __dirname,
      'src/napari_sphinx_theme/theme/napari_sphinx_theme/static',
    ),
  },

  externals: {
    // Define jQuery as external, this way Sphinx related javascript
    // and custom javascript like popper.js can hook into jQuery.
    jquery: 'jQuery',
  },

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src/napari_sphinx_theme/assets'),
    },

    extensions: ['.tsx', '.ts', '.js', '.json', '.scss'],
  },

  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          { loader: 'css-loader', options: { sourceMap: true } },
          { loader: 'postcss-loader', options: { sourceMap: true } },
          { loader: 'sass-loader', options: { sourceMap: true } },
        ],
      },

      {
        test: /\.tsx?/,
        exclude: /node_modules/,
        loader: 'ts-loader',
      },
    ],
  },

  plugins: [
    ...(isProd ? [] : [new webpack.HotModuleReplacementPlugin()]),
    new MiniCssExtractPlugin({ filename: 'styles/[name].css' }),
    new ForkTsCheckerPlugin(),
    new webpack.EnvironmentPlugin({
      ENV: process.env.ENV || 'local',
      GOOGLE_CALENDAR_API_KEY: '{google_calendar_api_key}',
      GOOGLE_CALENDAR_ID: '{google_calendar_id}',
      NODE_ENV: env,
    }),
  ],
};

module.exports = config;
