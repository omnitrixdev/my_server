import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { db } from "./db/index.js";
import { usersTable } from "./db/schema.js";
import { z } from "zod";
import { validator } from "hono/validator";

const schema = z.object({
  username: z.string(),
  password: z.string(),
  email: z.string(),
  age: z.number(),
});

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

app.post(
  "/auth",
  validator("form", (val, c) => {
    const parsed = schema.safeParse(val);
    if (!parsed.success) {
      return c.json(
        {
          success: false,
          message: "Invalid!",
          validation: parsed.error,
        },
        401,
      );
    }
    return parsed.data;
  }),
  async (c) => {
    const body = c.req.valid("form");
    const { username, password, email } = body;

    const newUser = await db
      .insert(usersTable)
      .values({
        name: username,
        age: 30,
        email: email,
        password,
      })
      .returning({
        id: usersTable.id,
      });

    return c.json({
      success: true,
      data: newUser,
    });
  },
);

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`> Server is running on http://localhost:${info.port} 🚀`);
  },
);
