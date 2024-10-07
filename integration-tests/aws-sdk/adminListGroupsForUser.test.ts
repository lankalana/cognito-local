import { ClockFake } from "../../src/__tests__/clockFake.js";
import { withCognitoSdk } from "./setup.js";

const originalDate = new Date();
const roundedDate = new Date(originalDate.getTime());
roundedDate.setMilliseconds(0);

const clock = new ClockFake(originalDate);

describe(
  "CognitoIdentityServiceProvider.adminListGroupsForUser",
  withCognitoSdk(
    (Cognito) => {
      it("lists groups for a user", async () => {
        const client = Cognito();

        const createGroupResponse = await client.createGroup({
          GroupName: "group-1",
          UserPoolId: "test",
        });

        await client.adminCreateUser({
          DesiredDeliveryMediums: ["EMAIL"],
          TemporaryPassword: "def",
          UserAttributes: [{ Name: "email", Value: "example+1@example.com" }],
          Username: "user-1",
          UserPoolId: "test",
        });

        await client.adminAddUserToGroup({
          Username: "user-1",
          GroupName: "group-1",
          UserPoolId: "test",
        });

        const result = await client.adminListGroupsForUser({
          UserPoolId: "test",
          Username: "user-1",
        });

        expect(result.Groups).toEqual([createGroupResponse.Group]);
      });

      it("lists groups for an unassigned user", async () => {
        const client = Cognito();

        await client.createGroup({
          GroupName: "group-2",
          UserPoolId: "test",
        });

        await client.adminCreateUser({
          DesiredDeliveryMediums: ["EMAIL"],
          TemporaryPassword: "def",
          UserAttributes: [{ Name: "email", Value: "example+1@example.com" }],
          Username: "user-1",
          UserPoolId: "test",
        });

        const result = await client.adminListGroupsForUser({
          UserPoolId: "test",
          Username: "user-1",
        });

        expect(result.Groups).toHaveLength(0);
      });
    },
    {
      clock,
    },
  ),
);
