import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { db } from '../db/index.js';
import { usersTable } from '../db/schema.js';
import { eq } from 'drizzle-orm';

const authRoutes = new Hono();

const registrationSchema = z.object({
  username: z
    .string()
    .min(3, { message: 'Username must be at least 3 characters long' }),
  email: z.string().email(),
  age: z.preprocess((val) => Number(val), z.number().int().min(0)),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Login endpoint
authRoutes.post('/login', zValidator('json', loginSchema), async (c) => {
  const { email, password } = c.req.valid('json');
  const { sign } = jwt;

  // Find user by email
  const user = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);

  if (!user.length) {
    return c.json(
      {
        success: false,
        message: 'Invalid email or password',
      },
      401,
    );
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(password, user[0].password);
  if (!isValidPassword) {
    return c.json(
      {
        success: false,
        message: 'Invalid email or password',
      },
      401,
    );
  }

  // Generate JWT token
  const token = sign(
    {
      userId: user[0].id,
    },
    process.env.JWT_SECRET || 'your-secret-key',
    {
      expiresIn: '1h',
    },
  );

  return c.json({
    success: true,
    data: {
      token,
      user: {
        id: user[0].id,
        name: user[0].name,
        email: user[0].email,
      },
    },
  });
});

// Registration endpoint
authRoutes.post(
  '/register',
  zValidator('json', registrationSchema),
  async (c) => {
    const { username, email, age, password } = c.req.valid('json');

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    if (existingUser.length) {
      return c.json(
        {
          success: false,
          message: 'Email already registered',
        },
        400,
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await db
      .insert(usersTable)
      .values({
        name: username,
        age,
        email,
        password: hashedPassword,
      })
      .returning({
        id: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
      });

    return c.json({
      success: true,
      data: newUser[0],
    });
  },
);

export { authRoutes };
