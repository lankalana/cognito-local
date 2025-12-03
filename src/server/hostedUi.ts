import type {
  InitiateAuthRequest,
  InitiateAuthResponse,
} from "@aws-sdk/client-cognito-identity-provider";
import type { Express } from "express";
import { AuthCodeStore } from "../services/authCodeStore";
import type { Context } from "../services/context";
import type { Target } from "../targets/Target";
import type { Router } from "./Router";
import { hostedLoginTemplate } from "./templates/hostedLogin";

export function registerHostedUi(app: Express, router: Router) {
  const authCodes = new AuthCodeStore();

  app.get("/oauth2/authorize", async (req, res) => {
    const routeLogger = req.log.child({
      route: "/oauth2/authorize",
      method: "GET",
    });
    routeLogger.debug("start");

    try {
      const { response_type, client_id, redirect_uri, state, scope } =
        req.query as Record<string, string | undefined>;

      if (response_type !== "code") {
        res.status(400).send("Only response_type=code is supported");
        return;
      }

      if (!client_id) {
        res.status(400).send("Missing client_id");
        return;
      }

      const html = hostedLoginTemplate
        .replace(/__CLIENT_ID__/g, client_id)
        .replace(/__REDIRECT_URI__/g, redirect_uri ?? "")
        .replace(/__RESPONSE_TYPE__/g, "code")
        .replace(/__STATE__/g, state ?? "")
        .replace(/__SCOPE__/g, scope ?? "");

      res.status(200).type("html").send(html);
      routeLogger.debug("end");
    } catch (ex) {
      req.log.error(ex);
      res.status(500).send(String(ex));
    }
  });

  app.post("/oauth2/authorize", async (req, res) => {
    const routeLogger = req.log.child({
      route: "/oauth2/authorize",
      method: "POST",
    });
    routeLogger.debug("start");

    try {
      // TODO validate redirect_uri
      const { username, password, client_id, redirect_uri, state, scope } =
        req.body as Record<string, string | undefined>;

      if (!client_id) {
        res.status(400).send("Missing client_id");
        return;
      }

      const initiateLogger = routeLogger.child({ target: "InitiateAuth" });
      const ctx: Context = { logger: initiateLogger };
      const initiate = router("InitiateAuth") as unknown as Target<
        InitiateAuthRequest,
        InitiateAuthResponse
      >;

      const authResp = await initiate(ctx, {
        ClientId: client_id,
        AuthFlow: "USER_PASSWORD_AUTH",
        AuthParameters: { USERNAME: username ?? "", PASSWORD: password ?? "" },
      } as InitiateAuthRequest);

      const authResult = authResp.AuthenticationResult;
      if (!authResult) {
        res
          .status(401)
          .send("Invalid username or password or challenge required");
        return;
      }

      const code = authCodes.create({
        clientId: client_id,
        username: username ?? "",
        redirectUri: redirect_uri,
        scope: scope ?? "",
        tokens: {
          AccessToken: authResult.AccessToken,
          IdToken: authResult.IdToken,
          RefreshToken: authResult.RefreshToken,
        },
      });

      const redirectTo = new URL(redirect_uri ?? "");
      redirectTo.searchParams.set("code", code);
      if (state) redirectTo.searchParams.set("state", state);

      res.redirect(302, redirectTo.toString());
      routeLogger.debug("end");
    } catch (ex) {
      req.log.error(ex);
      res.status(500).send(String(ex));
    }
  });

  app.post("/oauth2/token", async (req, res) => {
    const routeLogger = req.log.child({
      route: "/oauth2/token",
      method: "POST",
    });
    routeLogger.debug("start");

    try {
      const { grant_type } = req.body as Record<string, string | undefined>;
      if (grant_type !== "authorization_code") {
        res.status(400).json({ error: "unsupported_grant_type" });
        return;
      }

      const { code, redirect_uri, client_id } = req.body as Record<
        string,
        string | undefined
      >;

      if (!code) {
        res
          .status(400)
          .json({ error: "invalid_request", message: "Missing code" });
        return;
      }

      if (!client_id) {
        res
          .status(400)
          .json({ error: "invalid_request", message: "Missing client_id" });
        return;
      }

      const stored = authCodes.consume(code);
      if (!stored) {
        res
          .status(400)
          .json({ error: "invalid_grant", message: "Invalid code" });
        return;
      }

      if (stored.clientId !== client_id) {
        res.status(400).json({
          error: "invalid_grant",
          message: "Client ID does not match",
        });
        return;
      }

      if (
        stored.redirectUri &&
        redirect_uri &&
        stored.redirectUri !== redirect_uri
      ) {
        res.status(400).json({
          error: "invalid_grant",
          message: "Redirect URI does not match",
        });
        return;
      }

      if (!stored.tokens) {
        res
          .status(400)
          .json({ error: "invalid_grant", message: "No tokens available" });
        return;
      }

      res.status(200).json({
        access_token: stored.tokens.AccessToken,
        id_token: stored.tokens.IdToken,
        refresh_token: stored.tokens.RefreshToken,
        token_type: "Bearer",
        expires_in: 3600,
      });
      routeLogger.debug("end");
    } catch (ex) {
      req.log.error(ex);
      res.status(500).json({ error: "server_error" });
    }
  });
}
