import { Context } from 'hono';
import { AddWalletRequest, BulkAddResponse } from '../types';

export async function addToWaitlist(c: Context) {
  try {
    const body = await c.req.json<AddWalletRequest>();
    const { walletAddress } = body;

    // Basic wallet address validation
    if (!walletAddress?.match(/^0x[a-fA-F0-9]{40}$/)) {
      return c.json({ error: 'Invalid wallet address format' }, 400);
    }

    const kv = c.env.WAITLIST_KV;
    
    // Check if wallet already exists
    const existing = await kv.get(walletAddress);
    if (existing) {
      return c.json({ error: 'Wallet already registered' }, 409);
    }

    // Add wallet with timestamp
    const timestamp = Date.now();
    await kv.put(walletAddress, timestamp.toString());

    return c.json({ 
      walletAddress,
      joinedAt: timestamp
    }, 201);
  } catch (error) {
    console.error('Error adding to waitlist:', error);
    return c.json({ error: 'Failed to add to waitlist' }, 500);
  }
}

export async function getWaitlist(c: Context) {
  try {
    const kv = c.env.WAITLIST_KV;
    const { keys, list_complete } = await kv.list({});

    const entries = await Promise.all(
      keys.map(async (key) => {
        const timestamp = await kv.get(key.name);
        return {
          walletAddress: key.name,
          joinedAt: Number(timestamp)
        };
      })
    );

    return c.json({
      entries: entries.sort((a, b) => a.joinedAt - b.joinedAt),
      total: entries.length
    });
  } catch (error) {
    console.error('Error fetching waitlist:', error);
    return c.json({ error: 'Failed to fetch waitlist' }, 500);
  }
}

export async function bulkAddToWaitlist(c: Context) {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return c.json({ error: 'No file provided' }, 400);
    }

    const content = await file.text();
    // Split by either newline or comma
    const addresses = content
      .split(/[\n,]/)
      .map(addr => addr.trim())
      .filter(addr => addr.length > 0); // Remove empty lines

    const kv = c.env.WAITLIST_KV;
    const response: BulkAddResponse = {
      successful: [],
      failed: [],
      summary: {
        total: addresses.length,
        succeeded: 0,
        failed: 0
      }
    };

    // Process each address
    await Promise.all(
      addresses.map(async (walletAddress) => {
        try {
          // Validate address format
          if (!walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
            response.failed.push({
              walletAddress,
              reason: 'Invalid wallet address format'
            });
            response.summary.failed++;
            return;
          }

          // Check if already exists
          const existing = await kv.get(walletAddress);
          if (existing) {
            response.failed.push({
              walletAddress,
              reason: 'Already registered'
            });
            response.summary.failed++;
            return;
          }

          // Add to waitlist
          const timestamp = Date.now();
          await kv.put(walletAddress, timestamp.toString());
          
          response.successful.push({
            walletAddress,
            joinedAt: timestamp
          });
          response.summary.succeeded++;
        } catch (error) {
          response.failed.push({
            walletAddress,
            reason: 'Internal error'
          });
          response.summary.failed++;
        }
      })
    );

    return c.json(response, 201);
  } catch (error) {
    console.error('Error in bulk add:', error);
    return c.json({ error: 'Failed to process bulk addition' }, 500);
  }
} 