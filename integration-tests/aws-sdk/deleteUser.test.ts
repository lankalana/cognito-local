import { describe, expect, it } from "vitest";
import { withCognitoSdk } from "./setup";

describe(
  "CognitoIdentityServiceProvider.deleteUser",
  withCognitoSdk((Cognito) => {
    it("deletes the current user", async () => {
      const client = Cognito();

      const pool = await client.createUserPool({
        PoolName: "test",
      });
      const userPoolId = pool.UserPool!.Id!;

      // create the user pool client
      const upc = await client.createUserPoolClient({
        UserPoolId: userPoolId,
        ClientName: "test",
      });

      // create a user
      await client.adminCreateUser({
        DesiredDeliveryMediums: ["EMAIL"],
        TemporaryPassword: "def",
        UserAttributes: [{ Name: "email", Value: "example@example.com" }],
        Username: "abc",
        UserPoolId: userPoolId,
      });

      await client.adminSetUserPassword({
        Password: "newPassword",
        Permanent: true,
        Username: "abc",
        UserPoolId: userPoolId,
      });

      // attempt to login
      const initAuthResponse = await client.initiateAuth({
        ClientId: upc.UserPoolClient?.ClientId,
        AuthFlow: "USER_PASSWORD_AUTH",
        AuthParameters: {
          USERNAME: "abc",
          PASSWORD: "newPassword",
        },
      });

      // delete the user with their token
      await client.deleteUser({
        AccessToken: initAuthResponse.AuthenticationResult?.AccessToken,
      });

      // verify they don't exist anymore
      await expect(
        client.adminGetUser({
          Username: "abc",
          UserPoolId: userPoolId,
        }),
      ).rejects.toMatchObject({
        name: "UserNotFoundException",
        message: "User does not exist.",
      });
    });
  }),
);
