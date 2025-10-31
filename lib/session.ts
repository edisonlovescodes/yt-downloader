import "server-only";
import { headers } from "next/headers";
import { getWhopClient } from "./whop-sdk";

// Custom error classes
export class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class WhopConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WhopConfigurationError";
  }
}

// Session interface
export interface Session {
  userId: string;
  experienceId?: string;
}

type HeaderBag = Awaited<ReturnType<typeof headers>>;

interface SessionOptions {
  experienceId?: string;
}

/**
 * Require a valid Whop session from headers.
 * Throws UnauthorizedError if token is missing or invalid.
 */
async function requireSessionFromHeaders(
  incomingHeaders: HeaderBag,
  options?: SessionOptions,
): Promise<Session> {
  // Extract token from headers (check both lowercase and capitalized)
  const token =
    incomingHeaders.get("x-whop-user-token") ??
    incomingHeaders.get("X-Whop-User-Token");

  console.log("[session] Token present:", token ? "YES" : "NO");

  if (!token) {
    console.error("[session] Missing Whop user token header");
    throw new UnauthorizedError("Missing Whop user token header.");
  }

  const client = getWhopClient();
  let validation: Awaited<ReturnType<typeof client.verifyUserToken>> | null =
    null;

  try {
    console.log("[session] Calling verifyUserToken (client already has appID)");

    // The client is already initialized with appID, so we don't pass it again
    validation = await client.verifyUserToken(token);

    console.log("[session] Token verified successfully for user:", validation?.userId);
  } catch (error) {
    console.error("[session] Failed to verify Whop token:", error);
    throw new UnauthorizedError("Invalid Whop user token.");
  }

  if (!validation?.userId) {
    console.error("[session] Validation returned no userId");
    throw new UnauthorizedError("Invalid Whop user token.");
  }

  const session: Session = {
    userId: validation.userId,
    experienceId: options?.experienceId,
  };

  console.log("[session] Session created for user:", session.userId);
  return session;
}

/**
 * Get the current session, or null if not authenticated.
 * Does not throw errors - returns null on failure.
 */
export async function getOptionalSession(
  options?: SessionOptions,
): Promise<Session | null> {
  try {
    const headerList = await headers();
    const session = await requireSessionFromHeaders(headerList, options);
    return session;
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      console.log("[session] No valid session (unauthorized)");
      return null;
    }
    if (error instanceof WhopConfigurationError) {
      console.error("[session] Whop configuration error:", error.message);
      return null;
    }
    console.error("[session] Unexpected error getting session:", error);
    return null;
  }
}

/**
 * Require a valid session. Throws if not authenticated.
 */
export async function requireSession(
  options?: SessionOptions,
): Promise<Session> {
  const headerList = await headers();
  return requireSessionFromHeaders(headerList, options);
}
