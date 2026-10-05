// Lint ciblé : règles qui détectent de vrais bugs (pas de style — Prettier s'en charge).
import tsParser from "@typescript-eslint/parser";
import reactHooks from "eslint-plugin-react-hooks";

export default [
  { ignores: ["node_modules/**", ".next/**", "vendor/**", "public/**"] },
  {
    files: ["**/*.{ts,tsx,js,mjs}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: { ecmaVersion: "latest", sourceType: "module", ecmaFeatures: { jsx: true } },
    },
    plugins: { "react-hooks": reactHooks },
    rules: {
      // Hooks React appelés après un return ou dans une condition : plantage à l'exécution
      "react-hooks/rules-of-hooks": "error",
      "no-dupe-keys": "error",
      "no-unreachable": "error",
      "no-self-assign": "error",
      "no-dupe-else-if": "error",
    },
  },
];
