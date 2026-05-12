import { buildServer } from "./server.js";

const port = Number(process.env.PORT ?? 5099);
const host = process.env.HOST ?? "127.0.0.1";

const app = await buildServer();

try {
  await app.listen({ port, host });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}

