import { UUID } from "../../src/__tests__/patterns.js";
import { TestContext } from "../../src/__tests__/testContext.js";
import { withCognitoSdk } from "./setup.js";
import { User } from "../../src/services/userPoolService.js";

describe(
  "CognitoIdentityServiceProvider.verifyUserAttribute",
  withCognitoSdk((Cognito, { dataStoreFactory }) => {
    it("verifies a user's attribute", async () => {
      const client = Cognito();

      const pool = await client.createUserPool({
        PoolName: "test",
        AutoVerifiedAttributes: ["email"],
      });
      const userPoolId = pool.UserPool?.Id as string;

      const upc = await client.createUserPoolClient({
        UserPoolId: userPoolId,
        ClientName: "test",
      });

      await client.adminCreateUser({
        UserAttributes: [{ Name: "email", Value: "example@example.com" }],
        Username: "abc",
        UserPoolId: userPoolId,
        TemporaryPassword: "def",
        DesiredDeliveryMediums: ["EMAIL"],
      });

      await client.adminSetUserPassword({
        Username: "abc",
        UserPoolId: userPoolId,
        Password: "def",
        Permanent: true,
      });

      await client.adminUpdateUserAttributes({
        UserPoolId: userPoolId,
        Username: "abc",
        UserAttributes: [{ Name: "email", Value: "example2@example.com" }],
      });

      // get the user's code -- this is very nasty
      const ds = await dataStoreFactory().create(TestContext, userPoolId, {});
      const storedUser = (await ds.get(TestContext, ["Users", "abc"])) as User;

      // login as the user
      const initiateAuthResponse = await client.initiateAuth({
        AuthFlow: "USER_PASSWORD_AUTH",
        AuthParameters: {
          USERNAME: "abc",
          PASSWORD: "def",
        },
        ClientId: upc.UserPoolClient?.ClientId as string,
      });

      await client.verifyUserAttribute({
        AttributeName: "email",
        AccessToken: initiateAuthResponse.AuthenticationResult
          ?.AccessToken as string,
        Code: storedUser.AttributeVerificationCode as string,
      });

      const user = await client.adminGetUser({
        UserPoolId: userPoolId,
        Username: "abc",
      });

      expect(user.UserAttributes).toEqual([
        { Name: "sub", Value: expect.stringMatching(UUID) },
        { Name: "email", Value: "example2@example.com" },
        { Name: "email_verified", Value: "true" },
      ]);
    });
  }),
);
