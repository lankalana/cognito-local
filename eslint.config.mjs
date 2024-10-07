import typescriptEslint from "@typescript-eslint/eslint-plugin";
import simpleImportSort from "eslint-plugin-simple-import-sort"
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  ...compat.extends(
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "prettier"
  ),
  {
    plugins: {
      "@typescript-eslint": typescriptEslint,
      "simple-import-sort": simpleImportSort
    },

    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2020,
      sourceType: "module",

      parserOptions: {
        project: "./tsconfig.json",
      },
    },

    rules: {
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
    },

    ignores: ["eslint.config.mjs", "**/jest.config.cjs", ".prettierrc.js"],
  },
  {
    files: ["**/*.test.ts"],

    rules: {
      "@typescript-eslint/unbound-method": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
    },
  },
];
