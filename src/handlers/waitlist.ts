import { Context } from 'hono';
import { AddWalletRequest, BulkAddResponse } from '../types/index';

export async function addToWaitlist(c: Context) {
  try {
    const body = await c.req.json<AddWalletRequest>();
    const walletAddress = body.walletAddress?.toLowerCase();
    const allocation = body.allocation; // Get allocation from request body

    // Basic wallet address validation
    if (!walletAddress?.match(/^0x[a-f0-9]{40}$/)) {
      return c.json({ error: 'Invalid wallet address format' }, 400);
    }

    const kv = c.env.WAITLIST_KV;

    // Check if wallet already exists
    const existing = await kv.get(walletAddress);
    if (existing) {
      return c.json({ error: 'Wallet already registered' }, 409);
    }

    // Add wallet with allocation
    await kv.put(walletAddress, allocation.toString());

    return c.json({ 
      walletAddress,
      allocation
    }, 201);
  } catch (error) {
    return c.json({ error: 'Failed to add to waitlist' }, 500);
  }
}

export async function getWaitlist(c: Context) {
  try {
    const kv = c.env.WAITLIST_KV;
    const limit = parseInt(c.req.query('limit')) || 1000; // Default limit to 1000
    const cursor = c.req.query('cursor') || undefined; // Get cursor from query

    const { keys, list_complete } = await kv.list({
      limit,
      cursor,
    });

    const entries = await Promise.all(
      keys.map(async (key) => {
        const allocation = await kv.get(key.name);
        return {
          walletAddress: key.name,
          allocation: Number(allocation) || 0 // Return allocation or 0 if not found
        };
      })
    );

    return c.json({
      entries: entries.sort((a, b) => a.walletAddress.localeCompare(b.walletAddress)), // Sort by wallet address
      total: entries.length,
      hasMore: !list_complete, // Indicate if there are more entries
      nextCursor: list_complete ? null : cursor // Provide the next cursor if there are more entries
    });
  } catch (error) {
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
    const lines = content.split(/[\n]/).map(line => line.trim()).filter(line => line.length > 0);

    const kv = c.env.WAITLIST_KV;
    const response: BulkAddResponse = {
      successful: [],
      failed: [],
      summary: {
        total: lines.length,
        succeeded: 0,
        failed: 0
      }
    };

    // Split the lines into smaller batches
    const BATCH_SIZE = Math.ceil(lines.length / 5); // Split into 5 smaller requests

    for (let i = 0; i < lines.length; i += BATCH_SIZE) {
      const batch = lines.slice(i, i + BATCH_SIZE);
      for (const line of batch) {
        const [walletAddress, allocationStr] = line.split(',');

        const cleanedWalletAddress = walletAddress.trim().toLowerCase();
        const cleanedAllocationStr = allocationStr.trim();
        const allocation = parseFloat(cleanedAllocationStr);

        if (!cleanedWalletAddress.match(/^0x[a-f0-9]{40}$/) || isNaN(allocation)) {
          response.failed.push({
            walletAddress: cleanedWalletAddress,
            reason: 'Invalid wallet address or allocation format'
          });
          response.summary.failed++;
          continue; // Skip to the next line
        }

        const existing = await kv.get(cleanedWalletAddress);
        if (existing) {
          response.failed.push({
            walletAddress: cleanedWalletAddress,
            reason: 'Already registered'
          });
          response.summary.failed++;
          continue; // Skip to the next line
        }

        await kv.put(cleanedWalletAddress, allocation.toString());
        response.successful.push({
          walletAddress: cleanedWalletAddress,
          allocation
        });
        response.summary.succeeded++;
      }

      // Add a delay between batches to avoid hitting rate limits
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
    }

    return c.json(response, 201);
  } catch (error) {
    console.error('Error processing bulk addition:', error);
    return c.json({ error: 'Failed to process bulk addition' }, 500);
  }
}

export async function checkWallet(c: Context) {
  try {
    const walletAddress = c.req.param('walletAddress')?.toLowerCase();

    if (!walletAddress?.match(/^0x[a-f0-9]{40}$/)) {
      return c.json({ error: 'Invalid wallet address format' }, 400);
    }

    const kv = c.env.WAITLIST_KV;
    const allocation = await kv.get(walletAddress);
    
    if (!allocation) {
      return c.json({ allocation: 0 });
    }

    return c.json({
      allocation: Number(allocation) // Return allocation directly
    });
  } catch (error) {
    return c.json({ error: 'Failed to check wallet' }, 500);
  }
} 