import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Skill di terzi (impeccable, taste): non è codice nostro, non lo controlliamo.
    ".claude/**",
    "prove/report/**",
    // L'app mobile è un progetto TypeScript a sé: ha il suo `expo lint`.
    "mobile/**",
  ]),
]);

export default eslintConfig;
