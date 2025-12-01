import { describe, expect, it } from "vitest";
import { withCognitoSdk } from "./setup";

describe(
  "CognitoIdentityServiceProvider.updateGroup",
  withCognitoSdk((Cognito) => {
    it("updates a group", async () => {
      const client = Cognito();

      const pool = await client.createUserPool({
        PoolName: "test",
      });
      const userPoolId = pool.UserPool?.Id!;

      await client.createGroup({
        GroupName: "abc",
        UserPoolId: userPoolId,
        Description: "original description",
      });

      const getGroupResponse = await client.getGroup({
        GroupName: "abc",
        UserPoolId: userPoolId,
      });

      expect(getGroupResponse.Group).toMatchObject({
        GroupName: "abc",
        Description: "original description",
      });

      await client.updateGroup({
        GroupName: "abc",
        UserPoolId: userPoolId,
        Description: "new description",
      });

      const getGroupResponseAfterUpdate = await client.getGroup({
        GroupName: "abc",
        UserPoolId: userPoolId,
      });

      expect(getGroupResponseAfterUpdate.Group).toMatchObject({
        GroupName: "abc",
        Description: "new description",
      });
    });
  }),
);
