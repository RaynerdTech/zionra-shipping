/**
 * Responsibility:
 * Starts the self-hosted Zionra Next.js application through the port supplied
 * by the hosting platform.
 */

const http = require("node:http");
const next = require("next");

const port = Number.parseInt(process.env.PORT ?? "3000", 10);
const hostname = process.env.HOST ?? "0.0.0.0";
const isDevelopment = process.env.NODE_ENV !== "production";

if (!Number.isInteger(port) || port <= 0) {
  console.error("Invalid PORT environment variable.");
  process.exit(1);
}

const app = next({
  dev: isDevelopment,
  hostname,
  port,
});

const handle = app.getRequestHandler();

let server;

async function startServer() {
  await app.prepare();

  server = http.createServer((request, response) => {
    void handle(request, response);
  });

  server.listen(port, hostname, () => {
    console.log(
      `Zionra web application running on http://${hostname}:${port}`,
    );
  });
}

function shutDown(signal) {
  console.log(`${signal} received. Shutting down Zionra web application.`);

  if (!server) {
    process.exit(0);
  }

  server.close((error) => {
    if (error) {
      console.error("Zionra web application shutdown failed:", error);
      process.exit(1);
    }

    process.exit(0);
  });

  setTimeout(() => {
    console.error("Forced Zionra web application shutdown.");
    process.exit(1);
  }, 10_000).unref();
}

process.on("SIGTERM", () => shutDown("SIGTERM"));
process.on("SIGINT", () => shutDown("SIGINT"));

startServer().catch((error) => {
  console.error("Zionra web application failed to start:", error);
  process.exit(1);
});
