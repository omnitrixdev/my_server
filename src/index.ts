import { serve } from "@hono/node-server";
import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.get("/:name", (c) => {
  console.log(c);
  return c.text(`Hello ${c.req.param("name")}!`);
});

app.get("/dummy", (c) => {
  return c.json({ message: "Hello World!" });
});

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
