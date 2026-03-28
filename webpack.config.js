const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

const commonConfig = {
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
};

const mainConfig = {
  ...commonConfig,
  target: 'electron-main',
  entry: './src/main.ts',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },
};

const preloadConfig = {
  ...commonConfig,
  target: 'electron-preload',
  entry: './src/preload.ts',
  output: {
    filename: 'preload.js',
    path: path.resolve(__dirname, 'dist'),
  },
};

const controlRendererConfig = {
  ...commonConfig,
  target: 'electron-renderer',
  entry: './src/control/renderer.ts',
  output: {
    filename: 'renderer.js',
    path: path.resolve(__dirname, 'dist/control'),
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'src/control/index.html', to: 'index.html' },
        { from: 'src/control/style.css', to: 'style.css' },
      ],
    }),
  ],
};

const prompterRendererConfig = {
  ...commonConfig,
  target: 'electron-renderer',
  entry: './src/prompter/renderer.ts',
  output: {
    filename: 'renderer.js',
    path: path.resolve(__dirname, 'dist/prompter'),
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'src/prompter/index.html', to: 'index.html' },
        { from: 'src/prompter/style.css', to: 'style.css' },
      ],
    }),
  ],
};

module.exports = [mainConfig, preloadConfig, controlRendererConfig, prompterRendererConfig];
