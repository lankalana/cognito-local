import { withCognitoSdk } from "./setup.js";

describe(
  "CognitoIdentityServiceProvider.adminDisableUser",
  withCognitoSdk((Cognito) => {
    it("updates a user's attributes", async () => {
      const client = Cognito();

      await client.adminCreateUser({
        UserAttributes: [
          { Name: "email", Value: "example@example.com" },
          { Name: "custom:example", Value: "1" },
        ],
        Username: "abc",
        UserPoolId: "test",
        DesiredDeliveryMediums: ["EMAIL"],
      });

      await client.adminDisableUser({
        UserPoolId: "test",
        Username: "abc",
      });

      const user = await client.adminGetUser({
        UserPoolId: "test",
        Username: "abc",
      });

      expect(user.Enabled).toEqual(false);
    });
  }),
);
