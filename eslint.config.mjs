import js from "@eslint/js";

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        document: "readonly",
        window: "readonly",
        MutationObserver: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        HTMLElement: "readonly",
        Element: "readonly",
        NodeList: "readonly",
        Event: "readonly",
        KeyboardEvent: "readonly",
        MouseEvent: "readonly",
        console: "readonly",
        navigator: "readonly",
        requestAnimationFrame: "readonly",
        cancelAnimationFrame: "readonly",
        getComputedStyle: "readonly",
        ResizeObserver: "readonly",
        IntersectionObserver: "readonly",
        CustomEvent: "readonly",
        HTMLDialogElement: "readonly",
        matchMedia: "readonly",
        localStorage: "readonly",
        history: "readonly",
        location: "readonly",
        URL: "readonly",
        URLSearchParams: "readonly",
        fetch: "readonly",
        AbortController: "readonly",
        queueMicrotask: "readonly",
        structuredClone: "readonly",
        ClipboardItem: "readonly",
        Blob: "readonly",
      },
    },
    rules: {
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },
  {
    files: ["*.mjs"],
    languageOptions: {
      globals: {
        process: "readonly",
      },
    },
    rules: {
      "no-irregular-whitespace": "off",
    },
  },
  {
    files: ["js/theme-init.js"],
    rules: {
      "no-unused-vars": "off",
      "no-empty": "off",
    },
  },
  {
    ignores: ["dist/**", "node_modules/**"],
  },
];
