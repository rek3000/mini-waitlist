# Mini Waitlist API

A Cloudflare Workers API for managing a waitlist with wallet addresses.

## Setup

1. Clone the repository
```bash
git clone <repository-url>
cd mini-waitlist
```

2. Install dependencies
```bash
npm install
```

3. Create KV namespaces
```bash
npx wrangler kv:namespace create WAITLIST_KV
npx wrangler kv:namespace create WAITLIST_KV --preview
```

4. Create .dev.vars file for local development
```bash
API_KEY=your_api_key_here
```

5. Update wrangler.json with your KV namespace IDs
- Copy .env.example to .env
- Update the values with your KV namespace IDs and API key

6. Deploy
```bash
wrangler deploy
```

## Environment Variables

- `API_KEY`: API key for protected endpoints
- `WAITLIST_KV_ID`: KV namespace ID for production
- `WAITLIST_KV_PREVIEW_ID`: KV namespace ID for development

## API Documentation

API documentation is available at `/docs` endpoint when the service is running.
