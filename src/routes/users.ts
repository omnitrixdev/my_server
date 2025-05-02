import { Hono } from "hono";
import { db } from "../db/index.js";
import { usersTable } from "../db/schema.js";
import { eq } from "drizzle-orm";

const userRoutes = new Hono();

// Get all users
userRoutes.get("/", async (c) => {
  const users = await db.select().from(usersTable);
  return c.json({
    success: true,
    data: users,
  });
});

// Get user by ID
userRoutes.get("/:id", async (c) => {
  const id = c.req.param("id");
  const user = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, Number(id)))
    .limit(1);

  if (!user.length) {
    return c.json(
      {
        success: false,
        message: "User not found",
      },
      404,
    );
  }

  return c.json({
    success: true,
    data: user[0],
  });
});

export { userRoutes };
