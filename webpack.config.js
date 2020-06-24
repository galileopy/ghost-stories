const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: {
    bundle: "./src/index.js",
    "react/resource": "./src/react/resource.js",
    "react/field": "./src/react/field.js",
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
    library: "ghostStories",
    libraryTarget: "umd",
  },
  externals: {
    react: {
      commonjs: "react",
      commonjs2: "react",
      amd: "react",
      root: "react",
    },
    rxjs: {
      commonjs: "rxjs",
      commonjs2: "rxjs",
      amd: "rxjs",
      root: "rxjs",
    },
    "rxjs/operators": {
      commonjs: "rxjs/operators",
      commonjs2: "rxjs/operators",
      amd: "rxjs/operators",
      root: "rxjs/operators",
    },
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyPlugin({
      patterns: [
        { from: "src/constants.js" },
        { from: "src/index.js" },
        { from: "src/fetch", to: "fetch" },
        { from: "src/streams", to: "streams" },
        { from: "src/unions", to: "unions" },
      ],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
    ],
  },
};
