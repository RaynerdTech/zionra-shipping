/**
 * Responsibility:
 * Starts the Zionra API server.
 * Sets up global middleware, health check route, API route groups,
 * the not-found handler, and the final error handler.
 */

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import { API_ROUTES } from "./config/routes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFoundHandler } from "./middleware/notFound.js";
import customerAuthRoutes from "./routes/customerAuth.routes.js";

const app = express();

app.use(
  cors({
    origin: env.WEB_APP_URL,
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.get(API_ROUTES.health, (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "zionra-api",
  });
});

app.use(API_ROUTES.customerAuthBase, customerAuthRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`Zionra API running on http://localhost:${env.PORT}`);
});
