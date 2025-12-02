import jwt from "jsonwebtoken";
import { describe, expect, it } from "vitest";
import { withCognitoSdk } from "./setup";

describe(
  "Hosted UI authorize -> token",
  withCognitoSdk((Cognito, services) => {
    it("returns tokens for a valid user via authorize/token flow", async () => {
      const client = Cognito();

      const pool = await client.createUserPool({ PoolName: "test" });
      const userPoolId = pool.UserPool?.Id!;

      const upc = await client.createUserPoolClient({
        UserPoolId: userPoolId,
        ClientName: "hosted-ui-client",
        AllowedOAuthFlows: ["code"],
        AllowedOAuthFlowsUserPoolClient: true,
        CallbackURLs: ["http://example.com/callback"],
        AllowedOAuthScopes: ["openid"],
      });

      const clientId = upc.UserPoolClient?.ClientId!;

      const _ = await client.adminCreateUser({
        DesiredDeliveryMediums: ["EMAIL"],
        TemporaryPassword: "TempPass123!",
        UserAttributes: [{ Name: "email", Value: "example@example.com" }],
        Username: "alice",
        UserPoolId: userPoolId,
      });

      await client.adminSetUserPassword({
        UserPoolId: userPoolId,
        Username: "alice",
        Password: "TempPass123!",
        Permanent: true,
      });

      const base = services.baseUrl();

      // GET authorize -> form
      const authorizeUrl = `${base}/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(
        "http://example.com/callback",
      )}&state=xyz`;

      const getRes = await fetch(authorizeUrl);
      expect(getRes.status).toBe(200);
      const html = await getRes.text();
      expect(html).toContain("Sign in");

      // POST credentials to authorize
      const form = new URLSearchParams();
      form.set("username", "alice");
      form.set("password", "TempPass123!");
      form.set("client_id", clientId);
      form.set("redirect_uri", "http://example.com/callback");
      form.set("response_type", "code");
      form.set("state", "xyz");

      const postRes = await fetch(`${base}/oauth2/authorize`, {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: form.toString(),
        redirect: "manual",
      });

      expect(postRes.status).toBe(302);
      const location = postRes.headers.get("location");
      expect(location).toBeTruthy();

      const locUrl = new URL(location!);
      const code = locUrl.searchParams.get("code");
      expect(code).toBeTruthy();

      // Exchange code for tokens
      const tokenForm = new URLSearchParams();
      tokenForm.set("grant_type", "authorization_code");
      tokenForm.set("code", code!);
      tokenForm.set("client_id", clientId);
      tokenForm.set("redirect_uri", "http://example.com/callback");

      const tokenRes = await fetch(`${base}/oauth2/token`, {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: tokenForm.toString(),
      });

      expect(tokenRes.status).toBe(200);
      const body = await tokenRes.json();
      expect(body).toHaveProperty("access_token");
      expect(body).toHaveProperty("id_token");
      expect(body.token_type).toBe("Bearer");

      const idClaims = jwt.decode(body.id_token as string) as any;
      expect(idClaims.token_use).toBe("id");
      expect(idClaims["cognito:username"]).toBe("alice");
    });
  }),
);
