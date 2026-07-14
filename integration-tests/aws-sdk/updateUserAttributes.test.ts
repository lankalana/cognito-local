import { describe, expect, it } from "vitest";
import { UUID } from "../../src/__tests__/patterns";
import { withCognitoSdk } from "./setup";

describe(
  "CognitoIdentityServiceProvider.updateUserAttributes",
  withCognitoSdk((Cognito, { messageDelivery }) => {
    it("updates a user's attributes", async () => {
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
        UserAttributes: [
          { Name: "email", Value: "example@example.com" },
          { Name: "phone_number", Value: "0400000000" },
        ],
        Username: "abc",
        UserPoolId: userPoolId,
        TemporaryPassword: "def",
      });

      await client.adminSetUserPassword({
        UserPoolId: userPoolId,
        Username: "abc",
        Password: "def",
        Permanent: true,
      });

      // login as the user
      const initiateAuthResponse = await client.initiateAuth({
        AuthFlow: "USER_PASSWORD_AUTH",
        AuthParameters: {
          USERNAME: "abc",
          PASSWORD: "def",
        },
        ClientId: upc.UserPoolClient?.ClientId as string,
      });

      let user = await client.adminGetUser({
        UserPoolId: userPoolId,
        Username: "abc",
      });

      expect(user.UserAttributes).toEqual([
        { Name: "email", Value: "example@example.com" },
        { Name: "phone_number", Value: "0400000000" },
        { Name: "sub", Value: expect.stringMatching(UUID) },
      ]);

      await client.updateUserAttributes({
        AccessToken: initiateAuthResponse.AuthenticationResult?.AccessToken as string,
        UserAttributes: [{ Name: "email", Value: "example2@example.com" }],
      });

      user = await client.adminGetUser({
        UserPoolId: userPoolId,
        Username: "abc",
      });

      expect(user.UserAttributes).toEqual([
        { Name: "email", Value: "example2@example.com" },
        { Name: "email_verified", Value: "false" },
        { Name: "phone_number", Value: "0400000000" },
        { Name: "sub", Value: expect.stringMatching(UUID) },
      ]);
    });

    it("delays updating a user's attributes when they're in AttributesRequireVerificationBeforeUpdate until verification is complete", async () => {
      const originalEmail = "example@example.com";
      const newEmail = "new@example.com";
      const password = "abcdef";

      const client = Cognito();

      const pool = await client.createUserPool({
        PoolName: "test",
        AutoVerifiedAttributes: ["email"],
        UsernameAttributes: ["email"],
        UserAttributeUpdateSettings: {
          AttributesRequireVerificationBeforeUpdate: ["email"],
        },
      });
      const userPoolId = pool.UserPool?.Id as string;

      const upc = await client.createUserPoolClient({
        UserPoolId: userPoolId,
        ClientName: "test",
      });

      await client.adminCreateUser({
        UserAttributes: [
          { Name: "email", Value: originalEmail },
          { Name: "email_verified", Value: "true" },
        ],
        Username: originalEmail,
        UserPoolId: userPoolId,
        TemporaryPassword: password,
        DesiredDeliveryMediums: ["EMAIL"],
      });

      await client.adminSetUserPassword({
        UserPoolId: userPoolId,
        Username: originalEmail,
        Password: password,
        Permanent: true,
      });

      // login as the user
      let initiateAuthResponse = await client.initiateAuth({
        AuthFlow: "USER_PASSWORD_AUTH",
        AuthParameters: {
          USERNAME: originalEmail,
          PASSWORD: password,
        },
        ClientId: upc.UserPoolClient?.ClientId as string,
      });

      let user = await client.adminGetUser({
        UserPoolId: userPoolId,
        Username: originalEmail,
      });

      expect(user.UserAttributes).toEqual([
        { Name: "email", Value: originalEmail },
        { Name: "email_verified", Value: "true" },
        { Name: "sub", Value: expect.stringMatching(UUID) },
      ]);

      // start updating the email address, but it shouldn't be saved yet
      await client.updateUserAttributes({
        AccessToken: initiateAuthResponse.AuthenticationResult?.AccessToken as string,
        UserAttributes: [{ Name: "email", Value: newEmail }],
      });

      user = await client.adminGetUser({
        UserPoolId: userPoolId,
        Username: originalEmail,
      });

      // email is unchanged
      expect(user.UserAttributes).toEqual([
        { Name: "email", Value: originalEmail },
        { Name: "email_verified", Value: "true" },
        { Name: "sub", Value: expect.stringMatching(UUID) },
      ]);

      // confirm the user can still login with their original email and not yet with the new email
      initiateAuthResponse = await client.initiateAuth({
        AuthFlow: "USER_PASSWORD_AUTH",
        AuthParameters: {
          USERNAME: originalEmail,
          PASSWORD: password,
        },
        ClientId: upc.UserPoolClient?.ClientId as string,
      });
      await expect(
        client.initiateAuth({
          AuthFlow: "USER_PASSWORD_AUTH",
          AuthParameters: {
            USERNAME: newEmail,
            PASSWORD: password,
          },
          ClientId: upc.UserPoolClient?.ClientId as string,
        }),
      ).rejects.toThrow("User not authorized");

      // now verify the attribute with the confirmation code
      const messages = messageDelivery().collectedMessages;
      const lastMessage = messages.length ? messages[messages.length - 1] : undefined;
      const code = lastMessage?.message?.__code;
      expect(code).toBeDefined();

      await client.verifyUserAttribute({
        AccessToken: initiateAuthResponse.AuthenticationResult?.AccessToken as string,
        AttributeName: "email",
        Code: code!,
      });

      // get the user by their new email
      user = await client.adminGetUser({
        UserPoolId: userPoolId,
        Username: newEmail,
      });

      // email is updated and verified
      expect(user.UserAttributes).toEqual([
        { Name: "email", Value: newEmail },
        { Name: "email_verified", Value: "true" },
        { Name: "sub", Value: expect.stringMatching(UUID) },
      ]);

      // can login with the new email
      await client.initiateAuth({
        AuthFlow: "USER_PASSWORD_AUTH",
        AuthParameters: {
          USERNAME: newEmail,
          PASSWORD: password,
        },
        ClientId: upc.UserPoolClient?.ClientId as string,
      });

      // old email doesn't exist anymore
      await expect(
        client.adminGetUser({
          UserPoolId: userPoolId,
          Username: originalEmail,
        }),
      ).rejects.toThrow("User does not exist.");

      // cannot login with the old email either
      await expect(
        client.initiateAuth({
          AuthFlow: "USER_PASSWORD_AUTH",
          AuthParameters: {
            USERNAME: originalEmail,
            PASSWORD: password,
          },
          ClientId: upc.UserPoolClient?.ClientId as string,
        }),
      ).rejects.toThrow("User not authorized");
    });
  }),
);
