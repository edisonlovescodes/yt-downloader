import "server-only";
import Whop from "@whop/sdk";

export class WhopConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WhopConfigurationError";
  }
}

let cachedClient: InstanceType<typeof Whop> | null = null;

function resolveAppId() {
  return process.env.WHOP_APP_ID ?? process.env.NEXT_PUBLIC_WHOP_APP_ID ?? null;
}

export function getWhopClient() {
  if (cachedClient) {
    return cachedClient;
  }

  const apiKey = process.env.WHOP_API_KEY;
  const appId = resolveAppId();

  console.log("[whop-sdk] Initializing Whop client");
  console.log("[whop-sdk] API Key present:", !!apiKey);
  console.log("[whop-sdk] App ID present:", !!appId);
  console.log("[whop-sdk] App ID value:", appId?.substring(0, 15) + "...");

  if (!apiKey) {
    throw new WhopConfigurationError(
      "Missing WHOP_API_KEY environment variable.",
    );
  }

  if (!appId) {
    throw new WhopConfigurationError(
      "Missing WHOP_APP_ID (or NEXT_PUBLIC_WHOP_APP_ID) environment variable.",
    );
  }

  cachedClient = new Whop({
    apiKey,
    appID: appId,
  });

  console.log("[whop-sdk] Whop client initialized successfully");
  return cachedClient;
}
