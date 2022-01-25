const { resolve } = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const ForkTsCheckerPlugin = require('fork-ts-checker-webpack-plugin');
const { EnvironmentPlugin } = require('webpack');

const getAsset = (name) =>
  resolve(__dirname, './src/napari_sphinx_theme/assets', name);

module.exports = {
  mode: process.env.NODE_ENV || 'development',
  devtool: 'source-map',

  entry: {
    'napari-sphinx-theme': getAsset('napari.tsx'),
    'furo-extensions': getAsset('styles/furo-extensions.sass'),
  },

  output: {
    filename: 'scripts/[name].js',
    path: resolve(
      __dirname,
      'src/napari_sphinx_theme/theme/napari-sphinx-theme/static',
    ),
  },

  plugins: [
    new MiniCssExtractPlugin({ filename: 'styles/[name].css' }),
    new ForkTsCheckerPlugin(),
    new EnvironmentPlugin({
      ENV: process.env.ENV || 'local',
      GOOGLE_CALENDAR_API_KEY: '',
      GOOGLE_CALENDAR_ID: '',
      NODE_ENV: process.env.NODE_ENV || 'development',
    }),
  ],

  optimization: { minimizer: [`...`, new CssMinimizerPlugin()] },

  resolve: {
    alias: {
      '@': getAsset(''),
    },

    extensions: ['.tsx', '.ts', '.js', '.json'],
  },

  module: {
    rules: [
      {
        test: /\.s[ac]ss$/i,
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
};
