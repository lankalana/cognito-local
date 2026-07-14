import { describe, expect, it } from "vitest";
import { withCognitoSdk } from "./setup";

describe(
  "CognitoIdentityServiceProvider.adminDisableUser",
  withCognitoSdk((Cognito) => {
    it("updates a user's attributes", async () => {
      const client = Cognito();

      const pool = await client.createUserPool({
        PoolName: "test",
      });
      const userPoolId = pool.UserPool!.Id!;

      await client.adminCreateUser({
        UserAttributes: [
          { Name: "email", Value: "example@example.com" },
          { Name: "custom:example", Value: "1" },
        ],
        Username: "abc",
        UserPoolId: userPoolId,
        DesiredDeliveryMediums: ["EMAIL"],
      });

      await client.adminDisableUser({
        UserPoolId: userPoolId,
        Username: "abc",
      });

      const user = await client.adminGetUser({
        UserPoolId: userPoolId,
        Username: "abc",
      });

      expect(user.Enabled).toEqual(false);
    });
  }),
);
