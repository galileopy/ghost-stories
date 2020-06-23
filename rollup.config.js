import babel from "@rollup/plugin-babel";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

export default {
  input: "./src/index.js",
  output: {
    file: "./dist/bundle.min.js",
    format: "umd",
    name: "bundle",
    globals: {
      react: "React",
      rxjs: "rxjs",
      "rxjs/operators": "rxjs.operators",
      "folktale/validation": "folktale.validation",
    },
  },
  plugins: [
    resolve({
      jsnext: true,
      main: true,
      browser: true,
    }),
    commonjs({
      include: "node_modules/**",
    }),
    babel({
      exclude: "node_modules/**",
      presets: ["@babel/env", "@babel/preset-react"],
    }),
  ],
  treeshake: true,
  external: ["react", "rxjs", "rxjs/operators", "folktale/validation"],
};
