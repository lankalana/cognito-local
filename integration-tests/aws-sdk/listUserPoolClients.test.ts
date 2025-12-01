import { describe, expect, it } from "vitest";
import { withCognitoSdk } from "./setup";

describe(
  "CognitoIdentityServiceProvider.listUserPoolClients",
  withCognitoSdk((Cognito) => {
    it("can list app clients", async () => {
      const client = Cognito();

      const pool = await client.createUserPool({
        PoolName: "test",
      });
      const userPoolId = pool.UserPool?.Id!;

      const result = await client.createUserPoolClient({
        ClientName: "test",
        UserPoolId: userPoolId,
      });

      const _clientList = await client.listUserPoolClients({
        UserPoolId: userPoolId,
      });

      expect(_clientList).toEqual({
        $metadata: result.$metadata,
        UserPoolClients: [
          {
            ClientId: result.UserPoolClient?.ClientId,
            ClientName: result.UserPoolClient?.ClientName,
            UserPoolId: userPoolId,
          },
        ],
      });

      const clientList = await client.listUserPoolClients({
        UserPoolId: userPoolId,
      });

      expect(clientList?.UserPoolClients).toEqual([
        {
          ClientId: result.UserPoolClient?.ClientId,
          ClientName: result.UserPoolClient?.ClientName,
          UserPoolId: userPoolId,
        },
      ]);
    });
  }),
);
