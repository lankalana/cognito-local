import { withCognitoSdk } from "./setup";

describe(
  "CognitoIdentityServiceProvider.createUserPoolClient",
  withCognitoSdk((Cognito) => {
    it("can create a new app client", async () => {
      const client = Cognito();

      const result = await client.createUserPoolClient({
        ClientName: "test",
        UserPoolId: "test",
      });

      expect(result?.UserPoolClient).toEqual({
        ClientId: expect.stringMatching(/^[a-z0-9]{25}$/),
        ClientName: "test",
        CreationDate: expect.any(Date),
        LastModifiedDate: expect.any(Date),
        UserPoolId: "test",
        TokenValidityUnits: {
          AccessToken: "hours",
          IdToken: "minutes",
          RefreshToken: "days",
        },
      });

      const createdClient = await client.describeUserPoolClient({
        ClientId: result.UserPoolClient?.ClientId,
        UserPoolId: "test",
      });

      expect(createdClient.UserPoolClient).toEqual(result.UserPoolClient);
    });
  }),
);
