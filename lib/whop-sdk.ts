import "server-only";
import { WhopServerSdk, makeUserTokenVerifier } from "@whop/api";

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

export const whopSdk = WhopServerSdk({
  appId,
  appApiKey,
  onBehalfOfUserId,
});

export const verifyUserToken = makeUserTokenVerifier({
  appId,
});
