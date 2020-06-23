const path = require("path");

module.exports = {
  entry: "./src/index.js",
  output: {
    filename: "bundle.min.js",
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
