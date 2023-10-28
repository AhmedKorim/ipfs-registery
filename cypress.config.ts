import { defineConfig } from "cypress";
export default defineConfig({
  video:false,
  e2e: {
    screenshotsFolder:false,
    screenshotOnRunFailure:false,
    defaultCommandTimeout:80000,
    setupNodeEvents(on, config) {
      return require("./cypress/plugins/index.js")(on, config);
    },
    specPattern: "test/e2e/**/**/*.test.ts",

  },
});
