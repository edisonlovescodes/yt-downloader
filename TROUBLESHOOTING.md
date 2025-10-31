# Troubleshooting Guide - YouTube Downloader Whop App

## Authentication Issues

### Problem: "Authentication Error" for Non-Developer Accounts

**Symptoms:**
- Developer account can access the app successfully
- Non-developer accounts see "Authentication Error - Failed to verify your credentials"
- HTTP logs show 200 status but authentication fails

**Root Cause:**
The Whop SDK authentication implementation was incompatible with how Whop passes user tokens through the iframe.

**Investigation Process:**

1. **Initial Diagnosis** - Added debug logging to see what headers were being received:
   ```typescript
   const headersObj: Record<string, string> = {};
   headerList.forEach((value, key) => {
     headersObj[key] = value;
   });
   console.log('Received headers:', Object.keys(headersObj));
   console.log('Has x-whop-user-token:', headersObj['x-whop-user-token'] ? 'YES' : 'NO');
   ```

2. **Compared with Working Implementation** - Examined the `macro-tracker-whop` app that was working correctly and found key differences:

   | Aspect | Original (Broken) | Working (macro-tracker) |
   |--------|------------------|-------------------------|
   | SDK Package | `@whop/api` with `WhopServerSdk` | `@whop/sdk` with `new Whop()` |
   | Token Extraction | Passed headers to `verifyUserToken` | Manually extracted token string first |
   | Verification | `verifyUserToken(headerList, { dontThrow: true })` | `client.verifyUserToken(token)` |
   | Session Management | Inline in page component | Separate `session.ts` file |

3. **Error Messages in Logs:**
   ```
   [session] Token present: YES
   [session] Failed to verify Whop token: Error: Invalid app id provided to verifyUserToken
   ```

**Solution Implemented:**

### Step 1: Created Session Management Layer (`lib/session.ts`)

Implemented proper session management following the macro-tracker pattern:

```typescript
import "server-only";
import { headers } from "next/headers";
import { getWhopClient } from "./whop-sdk";

export class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnauthorizedError";
  }
}

async function requireSessionFromHeaders(
  incomingHeaders: HeaderBag,
  options?: SessionOptions,
): Promise<Session> {
  // Extract token from headers (check both lowercase and capitalized)
  const token =
    incomingHeaders.get("x-whop-user-token") ??
    incomingHeaders.get("X-Whop-User-Token");

  if (!token) {
    throw new UnauthorizedError("Missing Whop user token header.");
  }

  const client = getWhopClient();

  // Client already has appID, don't pass it again
  const validation = await client.verifyUserToken(token);

  if (!validation?.userId) {
    throw new UnauthorizedError("Invalid Whop user token.");
  }

  return {
    userId: validation.userId,
    experienceId: options?.experienceId,
  };
}

export async function getOptionalSession(
  options?: SessionOptions,
): Promise<Session | null> {
  try {
    const headerList = await headers();
    return await requireSessionFromHeaders(headerList, options);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return null;
    }
    throw error;
  }
}
```

### Step 2: Replaced SDK Implementation (`lib/whop-sdk.ts`)

Changed from `@whop/api` to `@whop/sdk`:

```typescript
import "server-only";
import Whop from "@whop/sdk";

export function getWhopClient() {
  const apiKey = process.env.WHOP_API_KEY;
  const appId = process.env.WHOP_APP_ID ?? process.env.NEXT_PUBLIC_WHOP_APP_ID;

  if (!apiKey || !appId) {
    throw new WhopConfigurationError("Missing WHOP_API_KEY or WHOP_APP_ID");
  }

  return new Whop({
    apiKey,
    appID: appId, // appID set here, don't pass again to verifyUserToken
  });
}
```

### Step 3: Simplified Experience Page

Replaced inline authentication with session management:

```typescript
import { getOptionalSession } from '@/lib/session';

export default async function ExperiencePage({ params }) {
  const session = await getOptionalSession({
    experienceId: params.experienceId
  });

  if (!session) {
    return <AuthenticationError />;
  }

  return <VideoDownloader userId={session.userId} />;
}
```

### Step 4: Fixed Critical Bug

**Problem:** Even after implementing the new SDK, still getting "Invalid app id provided to verifyUserToken"

**Cause:** Passing `appId` to `verifyUserToken()` when the client was already initialized with it:

```typescript
// ❌ WRONG - causes "Invalid app id" error
const client = new Whop({ apiKey, appID: appId });
validation = await client.verifyUserToken(token, { appId }); // Don't pass appId again!

// ✅ CORRECT - client already has appID
const client = new Whop({ apiKey, appID: appId });
validation = await client.verifyUserToken(token); // No appId parameter needed
```

### Step 5: Updated Dependencies

Added `@whop/sdk` to `package.json`:

```json
{
  "dependencies": {
    "@whop-apps/dev-proxy": "^0.0.1-canary.117",
    "@whop/api": "^0.0.51",
    "@whop/sdk": "^0.0.2",  // Added this
    "next": "14.1.0",
    "react": "^18",
    "react-dom": "^18"
  }
}
```

### Step 6: Fixed Docker Build

Railway build was failing with npm ci due to parent workspace configuration:

```dockerfile
# ❌ WRONG - fails with "package.json and package-lock.json are not in sync"
RUN npm ci

# ✅ CORRECT - handles parent workspace properly
RUN npm install
```

**Final Working Flow:**

1. User accesses app through Whop experience iframe
2. Whop passes `x-whop-user-token` header
3. `getOptionalSession()` extracts token from headers
4. `getWhopClient()` returns cached Whop SDK client (already initialized with appID)
5. `client.verifyUserToken(token)` validates token (no appId parameter needed)
6. Returns `{ userId }` for authenticated user
7. Page renders with user's session

**Verification:**

After deploying, check Railway Deploy Logs for:
```
[whop-sdk] Initializing Whop client
[whop-sdk] API Key present: true
[whop-sdk] App ID present: true
[session] Token present: YES
[session] Calling verifyUserToken (client already has appID)
[session] Token verified successfully for user: user_xxx
[experience] Valid session for user: user_xxx
```

## Environment Variables

Required environment variables in Railway:

```env
WHOP_API_KEY=your_api_key_here
NEXT_PUBLIC_WHOP_APP_ID=app_your_app_id
NEXT_PUBLIC_WHOP_AGENT_USER_ID=user_your_agent_id
NEXT_PUBLIC_WHOP_COMPANY_ID=biz_your_company_id
NODE_ENV=production
```

**Note:** The SDK supports both `WHOP_APP_ID` and `NEXT_PUBLIC_WHOP_APP_ID`.

## Deployment Issues

### Railway Build Failures

**Problem:** Build fails with "package.json and package-lock.json are not in sync"

**Cause:** Parent directory has workspace configuration that conflicts with `npm ci`

**Solution:** Use `npm install` instead of `npm ci` in Dockerfile:

```dockerfile
# Install ALL dependencies (including devDependencies for build)
# Use npm install instead of npm ci due to parent workspace configuration
RUN npm install
```

### Vercel Serverless Limitations

**Problem:** yt-dlp doesn't work on Vercel

**Cause:** yt-dlp requires Python runtime and system binaries (ffmpeg) which aren't available in Vercel's Node.js serverless environment

**Solution:** Deploy to Railway with Docker:

```dockerfile
FROM node:18-alpine

# Install Python, pip, ffmpeg
RUN apk add --no-cache python3 py3-pip ffmpeg curl

# Install yt-dlp in virtual environment
RUN python3 -m venv /opt/venv && \
    /opt/venv/bin/pip install --no-cache-dir yt-dlp

ENV PATH="/opt/venv/bin:$PATH"

# ... rest of Dockerfile
```

## Access Control

The app uses Whop's built-in access control through experiences:

1. User must have valid membership/access pass
2. Whop handles authentication via iframe and `x-whop-user-token` header
3. Token verification happens server-side
4. No separate access check needed if token is valid (access is implicit)

For explicit access checks:

```typescript
const whopSdk = getWhopClient();
const accessCheck = await whopSdk.access.checkIfUserHasAccessToExperience({
  experienceId: params.experienceId,
  userId: session.userId,
});

if (!accessCheck.hasAccess) {
  // Show access denied message
}
```

## Key Learnings

1. **Use `@whop/sdk` not `@whop/api`** - The newer SDK has better TypeScript support and clearer API
2. **Don't pass appId to verifyUserToken** - The client is already initialized with it
3. **Extract token manually** - Don't rely on SDK to extract from headers
4. **Use session pattern** - Separate session management from page components
5. **Check both header cases** - Look for both `x-whop-user-token` and `X-Whop-User-Token`
6. **Compare with working apps** - Macro-tracker is a good reference implementation
7. **Add comprehensive logging** - Use prefixes like `[session]`, `[whop-sdk]`, `[experience]`
8. **Railway > Vercel for system dependencies** - Use Docker when you need Python/ffmpeg/etc.

## Debugging Checklist

When authentication fails:

- [ ] Check Railway Deploy Logs (not HTTP Logs) for console output
- [ ] Verify environment variables are set in Railway
- [ ] Confirm `x-whop-user-token` header is present (`[session] Token present: YES`)
- [ ] Check if Whop SDK initializes (`[whop-sdk] Whop client initialized successfully`)
- [ ] Look for token verification errors
- [ ] Ensure you're accessing through Whop iframe, not direct Railway URL
- [ ] Verify Whop app settings have correct Railway URL as base URL
- [ ] Test with both developer and non-developer accounts

## Resources

- [Whop SDK Documentation](https://docs.whop.com)
- [Whop App Development Guide](https://docs.whop.com/apps)
- [Railway Documentation](https://docs.railway.app)
- [yt-dlp Documentation](https://github.com/yt-dlp/yt-dlp)

---

**Last Updated:** October 31, 2025
**Working Version:** Commit `20fbd55` - "Fix verifyUserToken - don't pass appId again"
