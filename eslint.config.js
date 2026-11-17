import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        React: "readonly"
      }
    },
    plugins: {
      "@typescript-eslint": tseslint,
      "react": react,
      "react-hooks": reactHooks
    },
    rules: {
      // Disallow console.log but allow console.warn and console.error
      "no-console": ["error", { "allow": ["warn", "error"] }],

      // TypeScript specific rules
      "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_|^node$", "varsIgnorePattern": "^_|^node$", "caughtErrors": "none", "ignoreRestSiblings": true }],
      "@typescript-eslint/no-explicit-any": "warn",
      "no-unused-vars": "off",

      // React specific rules
      "react/react-in-jsx-scope": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn"
    },
    settings: {
      react: {
        version: "detect"
      }
    }
  },
  {
    // The chemistry, physics, and biology textbooks are separate zero-build static sites: classic
    // <script> tags, no TypeScript, no bundler, no tests. That makes lint the
    // ONLY static analysis they can get, so they are configured here rather
    // than ignored.
    files: ["public/chem/**/*.js", "public/physics/**/*.js", "public/bio/**/*.js", "public/textbook/**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "script",
      globals: {
        ...globals.browser,
        // Cross-file globals defined for these textbooks.
        GC_ELEMENTS: "readonly",
        GC_GLOSSARY: "readonly",
        GP_GLOSSARY: "readonly",
        BIO_GLOSSARY: "readonly",
        GC_SCRUB_FN: "readonly",
        GC_SIMULATIONS: "readonly",
        GC_STORAGE: "readonly",
        StorageEngine: "readonly",
        LESSONS_MANIFEST: "readonly",
        // The shared runtime (public/textbook/): the book config, the glossary and the namespace.
        TB_BOOK: "readonly",
        TB_GLOSSARY: "readonly",
        TB: "writable",
      },
    },
    rules: {
      // no-undef stays ON (the whole point of linting this subtree)
      "no-unused-vars": ["warn", { "args": "none", "varsIgnorePattern": "^_|^\\$\\$?$", "caughtErrors": "none" }],
      "no-empty": ["warn", { "allowEmptyCatch": true }],
    },
  },
  {
    files: ["scripts/**/*.{js,mjs}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node,
        console: "readonly",
        process: "readonly"
      }
    },
    rules: {
      "no-redeclare": "off"
    }
  },
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "build/**",
      "coverage/**",
      "*.config.js",
      "*.config.ts",
      "vite.config.ts",
      "vitest.config.ts",
      "eslint.config.js",
    ]
  }
];
