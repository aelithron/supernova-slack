// adapted from https://github.com/aws-samples/amazon-chime-sdk/blob/main/utils/singlejs/rollup.config.js
import { defineConfig } from "rollup";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";
import json from "@rollup/plugin-json";

export default defineConfig({
  input: "huddles/chimesdkbuild.js",
  output: [{ file: "huddles/amazon-chime-sdk.min.js", format: "umd", name: "ChimeSDK", sourcemap: true, inlineDynamicImports: true }],
  plugins: [
    resolve({ browser: true, mainFields: ["module", "browser"] }),
    json(),
    commonjs(),
    terser()
  ],
  onwarn: (warning, next) => {
    if (warning.code === "CIRCULAR_DEPENDENCY" || warning.code === "THIS_IS_UNDEFINED" || warning.code === "EVAL") return;
    next(warning);
  },
});
