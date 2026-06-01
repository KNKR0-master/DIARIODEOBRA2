import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import Fastify from "fastify";
import { registerRoutes } from "./modules/routes.js";

export async function buildServer() {
  const app = Fastify({
    logger: true
  });

  await app.register(cors, {
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"]
  });

  await app.register(cookie);

  await registerRoutes(app);

  return app;
}
