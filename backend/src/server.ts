import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import fastifyStatic from "@fastify/static";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
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

  const sourceDir = dirname(fileURLToPath(import.meta.url));
  const webDistPath = process.env.WEB_DIST_PATH ?? resolve(sourceDir, "../../web/dist");

  if (existsSync(resolve(webDistPath, "index.html"))) {
    await app.register(fastifyStatic, {
      root: webDistPath,
      prefix: "/"
    });

    app.setNotFoundHandler((request, reply) => {
      if (request.method === "GET" && !request.url.startsWith("/api") && request.url !== "/health") {
        return reply.sendFile("index.html");
      }

      return reply.code(404).send({ error: "Not found" });
    });
  }

  return app;
}
