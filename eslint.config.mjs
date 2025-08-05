// eslint.config.ts
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import unusedImports from "eslint-plugin-unused-imports"; // ← add this line

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

export default [
  ...compat.extends("next", "next/core-web-vitals", "next/typescript"),

  /* register the plugin **before** any rules that reference it */
  {
    plugins: {
      "unused-imports": unusedImports,
    },
  },

  /* rules */
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/rules-of-hooks": "error",
      "react/no-unescaped-entities": ["warn", { forbid: [">", "}"] }],

      "@next/next/no-html-link-for-pages": "error",
      "@next/next/no-img-element": "warn",

      "prefer-const": "error",

      /* unused-imports rules */
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": "warn",
    },
  },

  /* ignore globs */
  { ignores: ["**/node_modules/**", ".next/**", "out/**", "public/**"] },
];
