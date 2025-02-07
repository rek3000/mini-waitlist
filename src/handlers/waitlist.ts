import { Context } from 'hono';
import { CreateWaitlistEntryRequest, WaitlistEntry, WaitlistMeta } from '../types';

const META_KEY = 'waitlist_meta';

export async function createWaitlistEntry(c: Context) {
  try {
    const body = await c.req.json<CreateWaitlistEntryRequest>();
    const { walletAddress, email } = body;

    // Basic wallet address validation
    if (!walletAddress?.match(/^0x[a-fA-F0-9]{40}$/)) {
      return c.json({ error: 'Invalid wallet address format' }, 400);
    }

    const kv = c.env.WAITLIST_KV;
    
    // Verify KV binding
    if (!kv || typeof kv.get !== 'function') {
      console.error('KV binding error:', {
        kv: !!kv,
        methods: kv ? Object.keys(kv) : null
      });
      return c.json({ 
        error: 'Server configuration error - KV not properly bound',
        details: 'Contact administrator'
      }, 500);
    }

    // Debug logging
    console.log('KV Namespace:', !!kv);
    console.log('Wallet Address:', walletAddress);
    console.log('Email:', email);

    // Check for existing entry
    const existingEntry = await kv.get(`entry:${walletAddress}`);
    console.log('Existing Entry:', existingEntry);

    if (existingEntry) {
      return c.json({ error: 'Wallet address already registered' }, 409);
    }

    // Get or initialize metadata
    let meta: WaitlistMeta = await kv.get(META_KEY, 'json') || {
      totalEntries: 0,
      lastPosition: 0,
      updatedAt: Date.now()
    };
    console.log('Current Meta:', meta);

    // Create new entry
    const newEntry: WaitlistEntry = {
      walletAddress,
      email,
      position: meta.lastPosition + 1,
      joinedAt: Date.now()
    };

    // Update metadata
    meta.totalEntries += 1;
    meta.lastPosition += 1;
    meta.updatedAt = Date.now();

    // Store entry and metadata
    await Promise.all([
      kv.put(`entry:${walletAddress}`, JSON.stringify(newEntry)),
      kv.put(META_KEY, JSON.stringify(meta))
    ]);

    return c.json({ entry: newEntry, meta }, 201);
  } catch (error) {
    // Enhanced error logging
    console.error('Error creating waitlist entry:', error);
    return c.json({ 
      error: 'Failed to create waitlist entry',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
}

export async function listWaitlistEntries(c: Context) {
  try {
    const kv = c.env.WAITLIST_KV;
    const limit = Number(c.req.query('limit')) || 100;
    const cursor = c.req.query('cursor');

    const { keys, list_complete, cursor: nextCursor } = await kv.list({
      prefix: 'entry:',
      limit,
      cursor
    });

    const entries = await Promise.all(
      keys.map(async (key) => {
        const entry = await kv.get(key.name, 'json');
        return entry as WaitlistEntry;
      })
    );

    const meta = await kv.get(META_KEY, 'json') as WaitlistMeta;

    return c.json({
      entries: entries.sort((a, b) => a.position - b.position),
      meta,
      pagination: {
        limit,
        hasMore: !list_complete,
        nextCursor: list_complete ? undefined : nextCursor
      }
    });
  } catch (error) {
    return c.json({ error: 'Failed to fetch waitlist entries' }, 500);
  }
}

export async function deleteWaitlistEntry(c: Context) {
  try {
    const { walletAddress } = c.req.param();
    const kv = c.env.WAITLIST_KV;

    // Check if entry exists
    const entryStr = await kv.get(`entry:${walletAddress}`);
    if (!entryStr) {
      return c.json({ error: 'Entry not found' }, 404);
    }

    const entry = JSON.parse(entryStr) as WaitlistEntry;
    const meta = await kv.get(META_KEY, 'json') as WaitlistMeta;

    // Delete entry
    await kv.delete(`entry:${walletAddress}`);

    // Update metadata
    meta.totalEntries -= 1;
    meta.updatedAt = Date.now();
    await kv.put(META_KEY, JSON.stringify(meta));

    return c.json({ 
      message: 'Entry deleted successfully',
      deletedEntry: entry 
    });
  } catch (error) {
    return c.json({ error: 'Failed to delete waitlist entry' }, 500);
  }
} 