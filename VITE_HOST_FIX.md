# Vite Host Configuration Fix

## Issue
Vite dev server was blocking requests from the preview domain:
```
Blocked request. This host ("fixall-explorer.preview.emergentagent.com") is not allowed.
```

## Root Cause
Vite v7 has stricter host checking by default for security. The preview domain was not in the allowed hosts list.

## Solution Applied

Updated `/app/frontend/vite.config.ts`:

```typescript
server: {
  port: 3000,
  host: '0.0.0.0', // Listen on all network interfaces
  strictPort: false,
  force: true,
  allowedHosts: [
    'localhost',
    '127.0.0.1',
    '.preview.emergentagent.com', // Wildcard for all preview subdomains
    'fixall-explorer.preview.emergentagent.com' // Specific domain
  ],
}
```

### Key Changes:
1. Changed `host: true` → `host: '0.0.0.0'` (explicit bind to all interfaces)
2. Added `allowedHosts` array with:
   - localhost and 127.0.0.1 (local development)
   - `.preview.emergentagent.com` (wildcard for all preview subdomains)
   - Specific preview domain

## Status
✅ **FIXED** - Application now accessible via preview domain

## Testing
```bash
# Test local access
curl http://localhost:3000

# Test with preview domain header
curl -H "Host: fixall-explorer.preview.emergentagent.com" http://localhost:3000
```

Both should return the HTML page without blocking.

## Additional Notes
- This is a standard Vite security feature to prevent DNS rebinding attacks
- The wildcard `.preview.emergentagent.com` allows any subdomain under preview.emergentagent.com
- No security concerns as this is for development/preview environments
