import { Hono } from 'hono';
import { cors } from 'hono/cors'
import { swaggerUI } from '@hono/swagger-ui'
import { addToWaitlist, getWaitlist, bulkAddToWaitlist, checkWallet } from './handlers/waitlist';
import { swaggerConfig } from './swagger';

// Define the type for our bindings
interface Bindings {
  WAITLIST_KV: KVNamespace;
}

const app = new Hono<{ Bindings: Bindings }>();

// Add CORS middleware
app.use('/*', cors({
  origin: '*', // Allow all origins
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type'],
  exposeHeaders: ['Content-Length', 'X-Kuma-Revision'],
  maxAge: 600,
  credentials: true,
}))

// Add Swagger UI
app.get('/docs', swaggerUI({ url: '/docs/json' }))
app.get('/docs/json', (c) => c.json(swaggerConfig))

// API endpoints
app.get('/waitlist', getWaitlist);
app.get('/waitlist/:walletAddress', checkWallet);
app.post('/waitlist', addToWaitlist);
app.post('/waitlist/bulk', bulkAddToWaitlist);

export default app;
