import { UUID } from "../../src/__tests__/patterns";
import { withCognitoSdk } from "./setup";

describe(
  "CognitoIdentityServiceProvider.updateUserAttributes",
  withCognitoSdk((Cognito) => {
    it("updates a user's attributes", async () => {
      const client = Cognito();

      const pool = await client
        .createUserPool({
          PoolName: "test",
          AutoVerifiedAttributes: ["email"],
        });
      const userPoolId = pool.UserPool?.Id as string;

      const upc = await client
        .createUserPoolClient({
          UserPoolId: userPoolId,
          ClientName: "test",
        });

      await client
        .adminCreateUser({
          UserAttributes: [
            { Name: "email", Value: "example@example.com" },
            { Name: "phone_number", Value: "0400000000" },
          ],
          Username: "abc",
          UserPoolId: userPoolId,
          TemporaryPassword: "def",
        });

      await client
        .adminSetUserPassword({
          UserPoolId: userPoolId,
          Username: "abc",
          Password: "def",
          Permanent: true,
        });

      // login as the user
      const initiateAuthResponse = await client
        .initiateAuth({
          AuthFlow: "USER_PASSWORD_AUTH",
          AuthParameters: {
            USERNAME: "abc",
            PASSWORD: "def",
          },
          ClientId: upc.UserPoolClient?.ClientId as string,
        });

      let user = await client
        .adminGetUser({
          UserPoolId: userPoolId,
          Username: "abc",
        });

      expect(user.UserAttributes).toEqual([
        { Name: "sub", Value: expect.stringMatching(UUID) },
        { Name: "email", Value: "example@example.com" },
        { Name: "phone_number", Value: "0400000000" },
      ]);

      await client
        .updateUserAttributes({
          AccessToken: initiateAuthResponse.AuthenticationResult
            ?.AccessToken as string,
          UserAttributes: [{ Name: "email", Value: "example2@example.com" }],
        });

      user = await client
        .adminGetUser({
          UserPoolId: userPoolId,
          Username: "abc",
        });

      expect(user.UserAttributes).toEqual([
        { Name: "sub", Value: expect.stringMatching(UUID) },
        { Name: "email", Value: "example2@example.com" },
        { Name: "phone_number", Value: "0400000000" },
        { Name: "email_verified", Value: "false" },
      ]);
    });
  })
);
