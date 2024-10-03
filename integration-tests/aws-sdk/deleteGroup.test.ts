import { GroupNotFoundError } from "../../src/errors";
import { withCognitoSdk } from "./setup";

describe(
  "CognitoIdentityServiceProvider.deleteGroup",
  withCognitoSdk((Cognito) => {
    it("deletes a group", async () => {
      const client = Cognito();

      await client.createGroup({
        GroupName: "abc",
        UserPoolId: "test",
      });

      const getGroupResponse = await client.getGroup({
        GroupName: "abc",
        UserPoolId: "test",
      });

      expect(getGroupResponse.Group).toBeDefined();

      await client.deleteGroup({
        GroupName: "abc",
        UserPoolId: "test",
      });

      await expect(
        client.getGroup({
          GroupName: "abc",
          UserPoolId: "test",
        }),
      ).rejects.toMatchObject(new GroupNotFoundError());
    });
  }),
);
