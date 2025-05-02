import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { db } from '../db/index.js';
import { usersTable } from '../db/schema.js';

const authRoutes = new Hono();

const registrationSchema = z.object({
  username: z.string().min(3, { message: 'Username must be at least 3 characters long' }),
  email: z.string().email(),
  age: z.preprocess((val) => Number(val), z.number().int().min(0)),
  password: z.string().min(6),
});

// Login endpoint
authRoutes.post('/login', async (c) => {
  const body = await c.req.json();
  const { username, password } = body;

  if (username === 'admin' && password === '123456') {
    return c.json({
      success: true,
      data: {
        token: '123456',
      },
    });
  }

  return c.json({
    success: false,
    message: 'Invalid username or password',
  });
});

// Registration endpoint
authRoutes.post(
  '/register',
  zValidator('json', registrationSchema),
  async (c) => {
    const { username, email, age, password } = c.req.valid('json');

    const newUser = await db
      .insert(usersTable)
      .values({
        name: username,
        age,
        email,
        password,
      })
      .returning({
        id: usersTable.id,
      });

    return c.json({
      success: true,
      data: newUser,
    });
  }
);

export { authRoutes }; 