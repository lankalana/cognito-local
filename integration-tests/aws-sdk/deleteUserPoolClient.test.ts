import { describe, expect, it } from "vitest";
import { withCognitoSdk } from "./setup";

describe(
  "CognitoIdentityServiceProvider.deleteUserPoolClient",
  withCognitoSdk((Cognito) => {
    it("deletes a user pool client", async () => {
      const client = Cognito();

      const pool = await client.createUserPool({
        PoolName: "test",
      });
      const userPoolId = pool.UserPool!.Id!;

      // create the user pool client
      const upc = await client.createUserPoolClient({
        UserPoolId: userPoolId,
        ClientName: "test",
      });

      const describeResponse = await client.describeUserPoolClient({
        ClientId: upc.UserPoolClient!.ClientId!,
        UserPoolId: userPoolId,
      });

      expect(describeResponse.UserPoolClient).toBeDefined();

      await client.deleteUserPoolClient({
        ClientId: upc.UserPoolClient!.ClientId!,
        UserPoolId: userPoolId,
      });

      await expect(
        client.describeUserPoolClient({
          ClientId: upc.UserPoolClient!.ClientId!,
          UserPoolId: userPoolId,
        }),
      ).rejects.toMatchObject({
        __type: "ResourceNotFoundException",
      });
    });
  }),
);
