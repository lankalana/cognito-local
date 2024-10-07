import { withCognitoSdk } from './setup.js';

describe(
  'CognitoIdentityServiceProvider.updateUserPoolClient',
  withCognitoSdk((Cognito) => {
    it('updates a user pool client', async () => {
      const client = Cognito();

      // create the user pool client
      const upc = await client.createUserPoolClient({
        UserPoolId: 'test',
        ClientName: 'test',
      });

      const describeResponse = await client.describeUserPoolClient({
        ClientId: upc.UserPoolClient?.ClientId,
        UserPoolId: 'test',
      });

      expect(describeResponse.UserPoolClient).toMatchObject({
        ClientName: 'test',
      });

      await client.updateUserPoolClient({
        ClientId: upc.UserPoolClient?.ClientId,
        UserPoolId: 'test',
        ClientName: 'new client name',
      });

      const describeResponseAfterUpdate = await client.describeUserPoolClient({
        ClientId: upc.UserPoolClient?.ClientId,
        UserPoolId: 'test',
      });

      expect(describeResponseAfterUpdate.UserPoolClient).toMatchObject({
        ClientName: 'new client name',
      });
    });
  })
);
