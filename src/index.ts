import { Hono } from 'hono';
import { swaggerUI } from '@hono/swagger-ui'
import { addToWaitlist, getWaitlist, bulkAddToWaitlist } from './handlers/waitlist';
import { swaggerConfig } from './swagger';

// Define the type for our bindings
interface Bindings {
  WAITLIST_KV: KVNamespace;
}

const app = new Hono<{ Bindings: Bindings }>();

// Add Swagger UI
app.get('/docs', swaggerUI({ url: '/docs/json' }))
app.get('/docs/json', (c) => c.json(swaggerConfig))

// API endpoints
app.get('/waitlist', getWaitlist);
app.post('/waitlist', addToWaitlist);
app.post('/waitlist/bulk', bulkAddToWaitlist);

export default app;
