import type { Context, Next } from 'hono';
import jwt from 'jsonwebtoken';
import { db } from '../db/index.js';
import { usersTable } from '../db/schema.js';
import { eq } from 'drizzle-orm';

// Extend the Context type to include user
declare module 'hono' {
  interface ContextVariableMap {
    user: {
      id: number;
      name: string;
      email: string;
    };
  }
}

export const authMiddleware = async (c: Context, next: Next) => {
  const { verify } = jwt;
  try {
    // Get token from Authorization header
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json(
        {
          success: false,
          message: 'No token provided',
        },
        401,
      );
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key',
    ) as {
      userId: number;
    };

    // Get user from database
    const user = await db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
      })
      .from(usersTable)
      .where(eq(usersTable.id, decoded.userId))
      .limit(1);

    if (!user.length) {
      return c.json(
        {
          success: false,
          message: 'User not found',
        },
        401,
      );
    }

    // Add user to context
    c.set('user', user[0]);

    // Continue to next middleware/route
    await next();
  } catch (error) {
    return c.json(
      {
        success: false,
        message: 'Invalid token',
      },
      401,
    );
  }
};
