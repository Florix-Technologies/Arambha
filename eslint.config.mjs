import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // node:test checks are CommonJS (.cjs): require() is their only import form, and the a11y check builds a vm `module`.
  { files: ["**/*.cjs"], rules: { "@typescript-eslint/no-require-imports": "off", "@next/next/no-assign-module-variable": "off" } },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
