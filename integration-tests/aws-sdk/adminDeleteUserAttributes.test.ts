import { UUID } from "../../src/__tests__/patterns.js";
import { withCognitoSdk } from "./setup.js";

describe(
  "CognitoIdentityServiceProvider.adminDeleteUserAttributes",
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

      let user = await client.adminGetUser({
        UserPoolId: "test",
        Username: "abc",
      });

      expect(user.UserAttributes).toEqual([
        { Name: "sub", Value: expect.stringMatching(UUID) },
        { Name: "email", Value: "example@example.com" },
        { Name: "custom:example", Value: "1" },
      ]);

      await client.adminDeleteUserAttributes({
        UserPoolId: "test",
        Username: "abc",
        UserAttributeNames: ["custom:example"],
      });

      user = await client.adminGetUser({
        UserPoolId: "test",
        Username: "abc",
      });

      expect(user.UserAttributes).toEqual([
        { Name: "sub", Value: expect.stringMatching(UUID) },
        { Name: "email", Value: "example@example.com" },
      ]);
    });
  }),
);
