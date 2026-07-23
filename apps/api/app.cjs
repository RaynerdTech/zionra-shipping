/**
 * Responsibility:
 * Loads the compiled Zionra API from a CommonJS startup file compatible with
 * CloudLinux Passenger while preserving the API's ES module build.
 */

void import("./dist/server.js").catch((error) => {
  console.error("Zionra API failed to start:", error);
  process.exit(1);
});
