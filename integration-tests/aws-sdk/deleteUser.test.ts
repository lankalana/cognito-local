import { UserNotFoundError } from '../../src/errors.js';
import { withCognitoSdk } from './setup.js';

describe(
  'CognitoIdentityServiceProvider.deleteUser',
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
        Password: 'newPassword',
        Permanent: true,
        Username: 'abc',
        UserPoolId: 'test',
      });

      // attempt to login
      const initAuthResponse = await client.initiateAuth({
        ClientId: upc.UserPoolClient?.ClientId,
        AuthFlow: 'USER_PASSWORD_AUTH',
        AuthParameters: {
          USERNAME: 'abc',
          PASSWORD: 'newPassword',
        },
      });

      // delete the user with their token
      await client.deleteUser({
        AccessToken: initAuthResponse.AuthenticationResult?.AccessToken,
      });

      // verify they don't exist anymore
      await expect(
        client.adminGetUser({
          Username: 'abc',
          UserPoolId: 'test',
        })
      ).rejects.toEqual(new UserNotFoundError('User does not exist.'));
    });
  })
);
