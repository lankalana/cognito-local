import type http from "node:http";
import net from "node:net";
import pino from "pino";
import { sink } from "pino-test";
import supertest from "supertest";
import { describe, expect, it, vi } from "vitest";
import { createServer } from "../src";
import {
  CodeMismatchError,
  CognitoError,
  InvalidPasswordError,
  NotAuthorizedError,
  UnsupportedError,
  UsernameExistsError,
} from "../src/errors";

const detectListenSupport = async () => {
  if (process.env.COGNITO_LOCAL_SKIP_NETWORK === "1") {
    return false;
  }

  return new Promise<boolean>((resolve) => {
    const server = net.createServer();
    server.once("error", () => resolve(false));
    server.listen(0, "127.0.0.1", () => {
      server.close(() => resolve(true));
    });
  });
};

const canListen = await detectListenSupport();
const describeIfNetwork = canListen ? describe : describe.skip;

const startTestServer = async (router: Parameters<typeof createServer>[0]) => {
  const server = createServer(router, pino(sink()), {
    hostname: "127.0.0.1",
    https: false,
    port: 0,
  });

  const httpServer = (await server.start()) as http.Server;
  const request = supertest(httpServer);

  return { httpServer, request };
};

const stopTestServer = (httpServer: http.Server) =>
  new Promise<void>((resolve) => {
    httpServer.close(() => resolve());
  });

describeIfNetwork("HTTP server", () => {
  describe("/", () => {
    it("errors with missing x-azm-target header", async () => {
      const router = vi.fn();
      const { httpServer, request } = await startTestServer(router);
      const response = await request.post("/");
      await stopTestServer(httpServer);

      expect(response.status).toEqual(400);
      expect(response.body).toEqual({ message: "Missing x-amz-target header" });
    });

    it("errors with an poorly formatted x-azm-target header", async () => {
      const router = vi.fn();
      const { httpServer, request } = await startTestServer(router);
      const response = await request
        .post("/")
        .set("x-amz-target", "bad-format");
      await stopTestServer(httpServer);

      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        message: "Invalid x-amz-target header",
      });
    });

    describe("a handled target", () => {
      it("returns the output of a matched target", async () => {
        const route = vi.fn().mockResolvedValue({
          ok: true,
        });
        const router = (target: string) =>
          target === "valid" ? route : () => Promise.reject();
        const { httpServer, request } = await startTestServer(router);
        const response = await request
          .post("/")
          .set("x-amz-target", "prefix.valid");
        await stopTestServer(httpServer);

        expect(response.status).toEqual(200);
        expect(response.text).toEqual('{"ok":true}');
      });

      it("converts UnsupportedErrors from within a target route to a 500 error", async () => {
        const route = vi
          .fn()
          .mockRejectedValue(new UnsupportedError("integration test"));
        const router = (target: string) =>
          target === "valid" ? route : () => Promise.reject();
        const { httpServer, request } = await startTestServer(router);
        const response = await request
          .post("/")
          .set("x-amz-target", "prefix.valid");
        await stopTestServer(httpServer);

        expect(response.status).toEqual(500);
        expect(response.body).toEqual({
          __type: "CognitoLocal#Unsupported",
          message: "Cognito Local unsupported feature: integration test",
        });
      });

      it.each`
        error                                          | code                          | message
        ${new CognitoError("CognitoError", "message")} | ${"CognitoError"}             | ${"message"}
        ${new NotAuthorizedError()}                    | ${"NotAuthorizedException"}   | ${"User not authorized"}
        ${new UsernameExistsError()}                   | ${"UsernameExistsException"}  | ${"User already exists"}
        ${new CodeMismatchError()}                     | ${"CodeMismatchException"}    | ${"Incorrect confirmation code"}
        ${new InvalidPasswordError()}                  | ${"InvalidPasswordException"} | ${"Invalid password"}
      `(
        "it converts $code to the format Cognito SDK expects",
        async ({ error, code, message }) => {
          const route = vi.fn().mockRejectedValue(error);
          const router = (target: string) =>
            target === "valid" ? route : () => Promise.reject();
          const { httpServer, request } = await startTestServer(router);
          const response = await request
            .post("/")
            .set("x-amz-target", "prefix.valid");
          await stopTestServer(httpServer);

          expect(response.status).toEqual(400);
          expect(response.body).toEqual({
            __type: `${code}`,
            message,
          });
        },
      );
    });
  });

  describe("jwks endpoint", () => {
    it("responds with our public key", async () => {
      const { httpServer, request } = await startTestServer(vi.fn());
      const response = await request.get(
        "/any-user-pool/.well-known/jwks.json",
      );
      await stopTestServer(httpServer);

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        keys: [
          {
            alg: "RS256",
            e: "AQAB",
            kid: "CognitoLocal",
            kty: "RSA",
            n: "2uLO7yh1_6Icfd89V3nNTc_qhfpDN7vEmOYlmJQlc9_RmOns26lg88fXXFntZESwHOm7_homO2Ih6NOtu4P5eskGs8d8VQMOQfF4YrP-pawVz-gh1S7eSvzZRDHBT4ItUuoiVP1B9HN_uScKxIqjmitpPqEQB_o2NJv8npCfqUAU-4KmxquGtjdmfctswSZGdz59M3CAYKDfuvLH9_vV6TRGgbUaUAXWC2WJrbbEXzK3XUDBrmF3Xo-yw8f3SgD3JOPl3HaaWMKL1zGVAsge7gQaGiJBzBurg5vwN61uDGGz0QZC1JqcUTl3cZnrx_L8isIR7074SJEuljIZRnCcjQ",
            use: "sig",
          },
        ],
      });
    });
  });

  describe("OpenId Configuration Endpoint", () => {
    it("responds with open id configuration", async () => {
      const { httpServer, request } = await startTestServer(vi.fn());
      const response = await request.get(
        "/any-user-pool/.well-known/openid-configuration",
      );
      await stopTestServer(httpServer);
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        id_token_signing_alg_values_supported: ["RS256"],
        jwks_uri: `http://localhost:9229/any-user-pool/.well-known/jwks.json`,
        issuer: `http://localhost:9229/any-user-pool`,
      });
    });
  });
});
