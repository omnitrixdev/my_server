import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.get("/some/:name", (c) => {
  console.log(c);
  return c.text(`Hello ${c.req.param("name")}!`);
});

app.get("/dummy", (c) => {
  const userAgent = c.req.header("User-Agent");
  return c.json({
    success: true,
    userAgent,
    data: [
      {
        id: 1,
        name: "John",
      },
      {
        id: 2,
        name: "Jane",
      },
    ],
  });
});

app.post("/login", async (c) => {
  const body = await c.req.json();
  const { username, password } = body;

  if (username === "admin" && password === "123456") {
    return c.json({
      success: true,
      data: {
        token: "123456",
      },
    });
  }

  return c.json({
    success: false,
    message: "Invalid username or password",
  });
});

app.post("/auth", async (c, next) => {
  // authentication
  const authorized = false;
  if (!authorized) {
    throw new HTTPException(401, { message: "Custom error message" });
  }
  await next();
});

// app.onError((err, c) => {
//   console.error(`${err}`);
//   return c.json({ error: "Custom Error Message" }, 500);
// });

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`> Server is running on http://localhost:${info.port} 🚀`);
  },
);
