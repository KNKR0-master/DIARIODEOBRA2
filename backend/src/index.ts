import { buildServer } from "./server.js";

const port = Number(process.env.PORT ?? 5100);
const host = process.env.HOST ?? (process.env.NODE_ENV === "production" ? "0.0.0.0" : "127.0.0.1");

const app = await buildServer();

try {
  await app.listen({ port, host });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
