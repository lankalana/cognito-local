import { ResourceNotFoundError } from "../../src/errors.js";
import { withCognitoSdk } from "./setup.js";

describe(
  "CognitoIdentityServiceProvider.deleteUserPoolClient",
  withCognitoSdk((Cognito) => {
    it("deletes a user pool client", async () => {
      const client = Cognito();

      // create the user pool client
      const upc = await client.createUserPoolClient({
        UserPoolId: "test",
        ClientName: "test",
      });

      const describeResponse = await client.describeUserPoolClient({
        ClientId: upc.UserPoolClient?.ClientId,
        UserPoolId: "test",
      });

      expect(describeResponse.UserPoolClient).toBeDefined();

      await client.deleteUserPoolClient({
        ClientId: upc.UserPoolClient?.ClientId,
        UserPoolId: "test",
      });

      await expect(
        client.describeUserPoolClient({
          ClientId: upc.UserPoolClient?.ClientId,
          UserPoolId: "test",
        }),
      ).rejects.toMatchObject(new ResourceNotFoundError());
    });
  }),
);
