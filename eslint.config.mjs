export default [
  // src/js/lib: librerías de terceros copiadas tal cual (ver LICENCIAS.txt)
  { ignores: ["src/js/lib/**"] },
  {
    files: ["src/**/*.js"],
    ignores: ["src/sw.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        window: "readonly",
        document: "readonly",
        localStorage: "readonly",
        navigator: "readonly",
        Audio: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        console: "readonly",
        alert: "readonly",
        confirm: "readonly",
        requestAnimationFrame: "readonly",
        URLSearchParams: "readonly",
      },
    },
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "error",
      eqeqeq: "warn",
      "no-var": "error",
    },
  },
  {
    files: ["src/sw.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "script",
      globals: {
        self: "readonly",
        caches: "readonly",
        fetch: "readonly",
        console: "readonly",
      },
    },
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "error",
      eqeqeq: "warn",
      "no-var": "error",
    },
  },
];
