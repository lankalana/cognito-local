import { withCognitoSdk } from "./setup";

describe(
  "CognitoIdentityServiceProvider.adminConfirmSignUp",
  withCognitoSdk((Cognito) => {
    it("confirms a user", async () => {
      const client = Cognito();

      const upc = await client.createUserPoolClient({
        UserPoolId: "test",
        ClientName: "test",
      });

      await client.signUp({
        UserAttributes: [{ Name: "phone_number", Value: "0400000000" }],
        Username: "abc",
        ClientId: upc.UserPoolClient?.ClientId,
        Password: "def",
      });

      let user = await client.adminGetUser({
        UserPoolId: "test",
        Username: "abc",
      });

      expect(user.UserStatus).toEqual("UNCONFIRMED");

      await client.adminConfirmSignUp({
        UserPoolId: "test",
        Username: "abc",
      });

      user = await client.adminGetUser({
        UserPoolId: "test",
        Username: "abc",
      });

      expect(user.UserStatus).toEqual("CONFIRMED");
    });
  }),
);
