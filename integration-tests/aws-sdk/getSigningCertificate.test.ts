import { X509Certificate } from "node:crypto";
import { describe, expect, it } from "vitest";
import { withCognitoSdk } from "./setup";

describe(
  "CognitoIdentityServiceProvider.getSigningCertificate",
  withCognitoSdk((Cognito) => {
    it("returns a certificate for an existing user pool", async () => {
      const client = Cognito();

      const pool = await client.createUserPool({
        PoolName: "test",
      });

      const result = await client.getSigningCertificate({
        UserPoolId: pool.UserPool!.Id!,
      });

      const certificate = new X509Certificate(Buffer.from(result.Certificate!, "base64"));
      expect(certificate.subject).toEqual("CN=cognito-local");
    });

    it("throws for an unknown user pool", async () => {
      const client = Cognito();

      await expect(
        client.getSigningCertificate({
          UserPoolId: "local_missing",
        }),
      ).rejects.toMatchObject({ name: "ResourceNotFoundException" });
    });
  }),
);
