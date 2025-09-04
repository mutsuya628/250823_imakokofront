import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // パフォーマンス最適化
      "@next/next/no-img-element": "error",
      "@next/next/no-page-custom-font": "warn",
      
      // 型安全性
      "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
      "@typescript-eslint/no-explicit-any": "warn",
      
      // React最適化
      "react-hooks/exhaustive-deps": "error",
      "react/no-unescaped-entities": "error",
      
      // 一般的なベストプラクティス
      "no-console": ["warn", { "allow": ["warn", "error"] }],
      "prefer-const": "error"
    }
  }
];

export default eslintConfig;
