import "server-only";
import { WhopServerSdk, makeUserTokenVerifier } from "@whop/api";

function getWhopConfig() {
  const appId = process.env.NEXT_PUBLIC_WHOP_APP_ID;
  const appApiKey = process.env.WHOP_API_KEY;
  const onBehalfOfUserId = process.env.NEXT_PUBLIC_WHOP_AGENT_USER_ID;

  if (!appId) {
    throw new Error("NEXT_PUBLIC_WHOP_APP_ID is required");
  }

  if (!appApiKey) {
    throw new Error("WHOP_API_KEY is required");
  }

  if (!onBehalfOfUserId) {
    throw new Error("NEXT_PUBLIC_WHOP_AGENT_USER_ID is required");
  }

  return { appId, appApiKey, onBehalfOfUserId };
}

let _whopSdk: ReturnType<typeof WhopServerSdk> | null = null;
let _verifyUserToken: ReturnType<typeof makeUserTokenVerifier> | null = null;

export function getWhopSdk() {
  if (!_whopSdk) {
    const config = getWhopConfig();
    _whopSdk = WhopServerSdk({
      appId: config.appId,
      appApiKey: config.appApiKey,
      onBehalfOfUserId: config.onBehalfOfUserId,
    });
  }
  return _whopSdk;
}

export function getVerifyUserToken() {
  if (!_verifyUserToken) {
    const { appId } = getWhopConfig();
    _verifyUserToken = makeUserTokenVerifier({ appId });
  }
  return _verifyUserToken;
}

// Legacy exports for backwards compatibility
export const whopSdk = new Proxy({} as ReturnType<typeof WhopServerSdk>, {
  get(target, prop) {
    return getWhopSdk()[prop as keyof ReturnType<typeof WhopServerSdk>];
  }
});

export const verifyUserToken = (...args: Parameters<ReturnType<typeof makeUserTokenVerifier>>) => {
  return getVerifyUserToken()(...args);
};
