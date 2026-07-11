/**
 * Responsibility:
 * Starts the Zionra API server.
 * Sets up global middleware, health check route, and API route groups.
 */

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
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

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "zionra-api",
  });
});

app.use("/api/customer/auth", customerAuthRoutes);

app.use((_req, res) => {
  res.status(404).json({
    message: "Route not found.",
  });
});

app.listen(env.PORT, () => {
  console.log(`Zionra API running on http://localhost:${env.PORT}`);
});