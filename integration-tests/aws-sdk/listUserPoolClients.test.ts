import { withCognitoSdk } from './setup.js';

describe(
  'CognitoIdentityServiceProvider.listUserPoolClients',
  withCognitoSdk((Cognito) => {
    it('can list app clients', async () => {
      const client = Cognito();

      const result = await client.createUserPoolClient({
        ClientName: 'test',
        UserPoolId: 'test',
      });

      const clientList = await client.listUserPoolClients({
        UserPoolId: 'test',
      });

      expect(clientList?.UserPoolClients).toEqual([
        {
          ClientId: result.UserPoolClient?.ClientId,
          ClientName: result.UserPoolClient?.ClientName,
          UserPoolId: 'test',
        },
      ]);
    });
  })
);
