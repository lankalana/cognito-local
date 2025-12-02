import { describe, expect, it } from "vitest";
import { withCognitoSdk } from "./setup";

describe(
  "CognitoIdentityServiceProvider.deleteGroup",
  withCognitoSdk((Cognito) => {
    it("deletes a group", async () => {
      const client = Cognito();

      const pool = await client.createUserPool({
        PoolName: "test",
      });
      const userPoolId = pool.UserPool?.Id!;

      await client.createGroup({
        GroupName: "abc",
        UserPoolId: userPoolId,
      });

      const getGroupResponse = await client.getGroup({
        GroupName: "abc",
        UserPoolId: userPoolId,
      });

      expect(getGroupResponse.Group).toBeDefined();

      await client.deleteGroup({
        GroupName: "abc",
        UserPoolId: userPoolId,
      });

      await expect(
        client.getGroup({
          GroupName: "abc",
          UserPoolId: userPoolId,
        }),
      ).rejects.toMatchObject({
        __type: "ResourceNotFoundException",
      });
    });
  }),
);
