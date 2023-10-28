const webpack = require("webpack");
const NodePolyfillPlugin  =  require( 'node-polyfill-webpack-plugin');
require("dotenv").config();

module.exports = {
  mode: "development",
  resolve: {
    extensions: [".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: [/node_modules/],
        use: [
          {
            loader: "ts-loader",
          },
        ],
      },
    ],
  },
  plugins: [
    new NodePolyfillPlugin(),

    new webpack.ProvidePlugin({
      process: "process/browser",
      env: process.env,
    }),

  ],
};
