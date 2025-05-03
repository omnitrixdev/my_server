import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { db } from '../db/index.js';
import { categories } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth.js';

const categoryRoutes = new Hono();

// Apply auth middleware to all routes
categoryRoutes.use('/*', authMiddleware);

const createCategorySchema = z.object({
  name: z
    .string()
    .min(3, { message: 'Name must be at least 3 characters long' }),
  description: z.string().optional(),
  slug: z
    .string()
    .min(3, { message: 'Slug must be at least 3 characters long' }),
});

const updateCategorySchema = createCategorySchema.partial();

// Get all categories
categoryRoutes.get('/', async (c) => {
  const allCategories = await db.select().from(categories);
  return c.json({
    success: true,
    data: allCategories,
  });
});

// Get category by ID
categoryRoutes.get('/:id', async (c) => {
  const id = c.req.param('id');
  const category = await db
    .select()
    .from(categories)
    .where(eq(categories.id, Number(id)))
    .limit(1);

  if (!category.length) {
    return c.json(
      {
        success: false,
        message: 'Category not found',
      },
      404,
    );
  }

  return c.json({
    success: true,
    data: category[0],
  });
});

// Create category
categoryRoutes.post(
  '/',
  zValidator('json', createCategorySchema),
  async (c) => {
    const { name, description, slug } = c.req.valid('json');

    // Check if slug already exists
    const existingCategory = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, slug))
      .limit(1);

    if (existingCategory.length) {
      return c.json(
        {
          success: false,
          message: 'Slug already exists',
        },
        400,
      );
    }

    const newCategory = await db
      .insert(categories)
      .values({
        name,
        description,
        slug,
      })
      .returning();

    return c.json(
      {
        success: true,
        data: newCategory[0],
      },
      201,
    );
  },
);

// Update category
categoryRoutes.patch(
  '/:id',
  zValidator('json', updateCategorySchema),
  async (c) => {
    const id = c.req.param('id');
    const { name, description, slug } = c.req.valid('json');

    // Check if category exists
    const existingCategory = await db
      .select()
      .from(categories)
      .where(eq(categories.id, Number(id)))
      .limit(1);

    if (!existingCategory.length) {
      return c.json(
        {
          success: false,
          message: 'Category not found',
        },
        404,
      );
    }

    // If slug is being updated, check if it already exists
    if (slug) {
      const slugExists = await db
        .select()
        .from(categories)
        .where(eq(categories.slug, slug))
        .limit(1);

      if (slugExists.length && slugExists[0].id !== Number(id)) {
        return c.json(
          {
            success: false,
            message: 'Slug already exists',
          },
          400,
        );
      }
    }

    const updatedCategory = await db
      .update(categories)
      .set({
        name,
        description,
        slug,
        updatedAt: new Date(),
      })
      .where(eq(categories.id, Number(id)))
      .returning();

    return c.json({
      success: true,
      data: updatedCategory[0],
    });
  },
);

// Delete category
categoryRoutes.delete('/:id', async (c) => {
  const id = c.req.param('id');

  // Check if category exists
  const existingCategory = await db
    .select()
    .from(categories)
    .where(eq(categories.id, Number(id)))
    .limit(1);

  if (!existingCategory.length) {
    return c.json(
      {
        success: false,
        message: 'Category not found',
      },
      404,
    );
  }

  await db.delete(categories).where(eq(categories.id, Number(id)));

  return c.json({
    success: true,
    message: 'Category deleted successfully',
  });
});

export { categoryRoutes };
