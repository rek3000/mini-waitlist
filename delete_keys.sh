#!/bin/sh

RAW=$(wrangler kv:key list --namespace-id=$NAMESPACE_ID)

KEYS=$(echo "$RAW" | jq -r '.[].name' | jq -R -s 'split("\n")[:-1]')
echo $KEYS

curl https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/storage/kv/namespaces/$NAMESPACE_ID/bulk/delete \
    -H 'Content-Type: application/json' \
    -H "Authorization: Bearer $API_TOKEN" \
    -d "$KEYS"