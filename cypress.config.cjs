const { defineConfig } = require( "cypress");
module.exports = defineConfig({
  e2e: {
    defaultCommandTimeout:80000,
    setupNodeEvents(on, config) {
      return require("./cypress/plugins/index.cjs")(on, config);
    },
    specPattern: "test/e2e/**/**/*.test.ts",

  },
});
