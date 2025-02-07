import { Hono } from 'hono';
import { swaggerUI } from '@hono/swagger-ui'
import { authMiddleware } from './middleware/auth';
import { 
  createWaitlistEntry, 
  listWaitlistEntries, 
  deleteWaitlistEntry 
} from './handlers/waitlist';
import { swaggerConfig } from './swagger';

// Define the type for our bindings
interface Bindings {
  WAITLIST_KV: KVNamespace;
  API_KEY: string;
}

const app = new Hono<{ Bindings: Bindings }>();

// Add Swagger UI
app.get('/docs', swaggerUI({ url: '/docs/json' }))
app.get('/docs/json', (c) => c.json(swaggerConfig))

// Debug endpoint
app.get('/debug-env', async (c) => {
  const env = c.env;
  
  try {
    // Try to write and read from KV to verify it's working
    await env.WAITLIST_KV.put("test-key", "test-value");
    const value = await env.WAITLIST_KV.get("test-key");
    
    return c.json({
      apiKey: env.API_KEY,
      hasKV: !!env.WAITLIST_KV,
      kvTest: {
        value,
        success: value === "test-value"
      },
      kvMethods: env.WAITLIST_KV ? Object.keys(env.WAITLIST_KV) : null,
      envKeys: Object.keys(env)
    });
  } catch (error) {
    return c.json({
      error: "KV operation failed",
      details: error instanceof Error ? error.message : "Unknown error",
      hasKV: !!env.WAITLIST_KV,
      envKeys: Object.keys(env)
    }, 500);
  }
});

// Public endpoint - Get waitlist entries
app.get('/waitlist', listWaitlistEntries);

// Protected endpoints - require API key
app.post('/waitlist', authMiddleware, createWaitlistEntry);
app.delete('/waitlist/:walletAddress', authMiddleware, deleteWaitlistEntry);

export default app;
