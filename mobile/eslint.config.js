const { defineConfig, globalIgnores } = require("eslint/config");
const js = require("@eslint/js");
const tsParser = require("@typescript-eslint/parser");
const tsPlugin = require("@typescript-eslint/eslint-plugin");
const reactHooks = require("eslint-plugin-react-hooks");

/**
 * Lint dell'app mobile. Il config di radice ignora `mobile/**` apposta
 * (progetto TypeScript a sé), quindi qui serve un config proprio.
 * Niente dipendenze nuove: @eslint/js, il parser TypeScript e il plugin
 * dei hook arrivano già dal node_modules di radice.
 */
module.exports = defineConfig([
  globalIgnores([
    "node_modules/**",
    ".expo/**",
    "dist/**",
    "scripts/**",
    "expo-env.d.ts",
    "eslint.config.js",
  ]),
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      "react-hooks": reactHooks,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tsPlugin.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      // Il parser TypeScript conosce già i tipi: le regole base di ESLint
      // su variabili e ridefinizioni danno falsi positivi sui tipi globali.
      "no-undef": "off",
      "no-redeclare": "off",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
]);
