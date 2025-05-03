import { Hono } from 'hono';
import { db } from '../db/index.js';
import { usersTable } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth.js';

const userRoutes = new Hono();

// Apply auth middleware to all routes
userRoutes.use('/*', authMiddleware);

// Get all users
userRoutes.get('/', async (c) => {
  const users = await db.select().from(usersTable);
  return c.json({
    success: true,
    data: users,
  });
});

// Get user by ID
userRoutes.get('/:id', async (c) => {
  const id = c.req.param('id');
  const user = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, Number(id)))
    .limit(1);

  if (!user.length) {
    return c.json(
      {
        success: false,
        message: 'User not found',
      },
      404,
    );
  }

  return c.json({
    success: true,
    data: user[0],
  });
});

// Get current user profile
userRoutes.get('/me', async (c) => {
  // Get user from context (set by auth middleware)
  const user = c.get('user');
  return c.json({
    success: true,
    data: user,
  });
});

export { userRoutes };
