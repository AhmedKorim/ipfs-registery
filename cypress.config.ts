import { defineConfig } from "cypress";
export default defineConfig({
  e2e: {
    defaultCommandTimeout:80000,
    setupNodeEvents(on, config) {
      return require("./cypress/plugins/index.js")(on, config);
    },
    specPattern: "test/e2e/**/**/*.test.ts",

  },
});
