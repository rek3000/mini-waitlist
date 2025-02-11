import { Hono } from 'hono';
import { cors } from 'hono/cors'
import { swaggerUI } from '@hono/swagger-ui'
import { addToWaitlist, getWaitlist, bulkAddToWaitlist, checkWallet } from './handlers/waitlist';
import { swaggerConfig } from './swagger';
// import { authMiddleware } from './middleware/auth'; // Comment out or remove this line

// Define the type for our bindings
interface Bindings {
  WAITLIST_KV: KVNamespace;
}

const app = new Hono<{ Bindings: Bindings }>();

// Add CORS middleware
app.use('/*', cors({
  origin: '*', // Allow all origins
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type'], // Remove 'X-API-Key' if not needed
  exposeHeaders: ['Content-Length', 'X-Kuma-Revision'],
  maxAge: 600,
  credentials: true,
}))

// Add Swagger UI
app.get('/docs', swaggerUI({ url: '/docs/json' }))
app.get('/docs/json', (c) => c.json(swaggerConfig))

// API endpoints without authentication
app.get('/waitlist', getWaitlist);
app.get('/waitlist/:walletAddress', checkWallet);
app.post('/waitlist', addToWaitlist); // No auth middleware
app.post('/waitlist/bulk', bulkAddToWaitlist); // No auth middleware

export default app;
