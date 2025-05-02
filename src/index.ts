import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { routes } from "./routes/index.js";

const app = new Hono();

// Mount the API routes with /api/v1 prefix
app.route('/api/v1', routes);

// Health check endpoint
app.get("/", (c) => {
  return c.text("Server is running! 🚀");
});

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`> Server is running on http://localhost:${info.port} 🚀`);
  },
);
