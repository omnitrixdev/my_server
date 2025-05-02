import { Hono } from 'hono';
import { authRoutes } from './auth.js';
import { userRoutes } from './users.js';

const api = new Hono();

// Mount all route modules
api.route('/auth', authRoutes);
api.route('/users', userRoutes);

export const routes = api; 