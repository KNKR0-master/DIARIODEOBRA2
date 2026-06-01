import cors from "@fastify/cors";
import Fastify from "fastify";
import { registerRoutes } from "./modules/routes.js";

export async function buildServer() {
  const app = Fastify({
    logger: true
  });

  await app.register(cors, {
    origin: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"]
  });

  await registerRoutes(app);

  return app;
}
