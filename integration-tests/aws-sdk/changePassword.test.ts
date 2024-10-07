import { withCognitoSdk } from './setup.js';

describe(
  'CognitoIdentityServiceProvider.changePassword',
  withCognitoSdk((Cognito) => {
    it('deletes the current user', async () => {
      const client = Cognito();

      // create the user pool client
      const upc = await client.createUserPoolClient({
        UserPoolId: 'test',
        ClientName: 'test',
      });

      // create a user
      await client.adminCreateUser({
        DesiredDeliveryMediums: ['EMAIL'],
        TemporaryPassword: 'def',
        UserAttributes: [{ Name: 'email', Value: 'example@example.com' }],
        Username: 'abc',
        UserPoolId: 'test',
      });

      await client.adminSetUserPassword({
        Password: 'firstPassword',
        Permanent: true,
        Username: 'abc',
        UserPoolId: 'test',
      });

      // login
      const initAuthResponse = await client.initiateAuth({
        ClientId: upc.UserPoolClient?.ClientId,
        AuthFlow: 'USER_PASSWORD_AUTH',
        AuthParameters: {
          USERNAME: 'abc',
          PASSWORD: 'firstPassword',
        },
      });

      // delete the user with their token
      await client.changePassword({
        AccessToken: initAuthResponse.AuthenticationResult?.AccessToken,
        PreviousPassword: 'firstPassword',
        ProposedPassword: 'secondPassword',
      });

      // (fail to) login with the old password
      await expect(
        client.initiateAuth({
          ClientId: upc.UserPoolClient?.ClientId,
          AuthFlow: 'USER_PASSWORD_AUTH',
          AuthParameters: {
            USERNAME: 'abc',
            PASSWORD: 'firstPassword',
          },
        })
      ).rejects.toBeDefined();

      // login with the new password
      const initAuthResponse2nd = await client.initiateAuth({
        ClientId: upc.UserPoolClient?.ClientId,
        AuthFlow: 'USER_PASSWORD_AUTH',
        AuthParameters: {
          USERNAME: 'abc',
          PASSWORD: 'secondPassword',
        },
      });

      expect(initAuthResponse2nd).toBeDefined();
    });
  })
);
