import { Context, Next } from 'hono';

/**
 * Middleware to validate API key from request headers
 */
export async function authMiddleware(c: Context, next: Next) {
  const apiKey = c.env.API_KEY;
  const providedKey = c.req.header('X-API-Key');

  console.log('Expected API Key:', apiKey);
  console.log('Provided API Key:', providedKey);
  console.log('Headers:', c.req.header());

  if (!apiKey) {
    return c.json(
      {
        error: 'Server configuration error - API key not set',
        environment: c.env,
      },
      500
    );
  }

  if (!providedKey || providedKey !== apiKey) {
    return c.json(
      {
        error: 'Unauthorized - Invalid or missing API key',
        expected: apiKey,
        provided: providedKey,
        headers: c.req.header()
      },
      401
    );
  }

  await next();
} 