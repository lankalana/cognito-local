import { withCognitoSdk } from "./setup.js";

describe(
  "CognitoIdentityServiceProvider.deleteUserPool",
  withCognitoSdk((Cognito) => {
    it("deletes a group", async () => {
      const client = Cognito();

      // create the user pool
      const up = await client.createUserPool({
        PoolName: "newPool",
      });

      const listResponse = await client.listUserPools({
        MaxResults: 1,
      });

      expect(listResponse.UserPools).toEqual([
        expect.objectContaining({
          Id: up.UserPool?.Id,
        }),
      ]);

      await client.deleteUserPool({
        UserPoolId: up.UserPool?.Id,
      });

      const listResponseAfter = await client.listUserPools({ MaxResults: 1 });

      expect(listResponseAfter.UserPools).toHaveLength(0);
    });
  }),
);
