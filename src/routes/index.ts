import { Hono } from 'hono';
import { authRoutes } from './auth.js';
import { userRoutes } from './users.js';
import { categoryRoutes } from './categories.js';

const api = new Hono();

// Mount all route modules
api.route('/auth', authRoutes);
api.route('/users', userRoutes);
api.route('/categories', categoryRoutes);

export const routes = api;
