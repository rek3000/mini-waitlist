import { Context, Next } from 'hono';

/**
 * Middleware to validate API key from request headers
 */
export async function authMiddleware(c: Context, next: Next) {
  const apiKey = c.env.API_KEY;
  const providedKey = c.req.header('X-API-Key');

  if (!apiKey) {
    return c.json(
      {
        error: 'Server configuration error - API key not set'
      },
      500
    );
  }

  if (!providedKey || providedKey !== apiKey) {
    return c.json(
      {
        error: 'Unauthorized - Invalid or missing API key'
      },
      401
    );
  }

  await next();
} 