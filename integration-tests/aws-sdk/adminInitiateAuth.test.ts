import * as jwt from 'jsonwebtoken';

import { UUID } from '../../src/__tests__/patterns.js';
import { UserNotConfirmedException } from '../../src/errors.js';
import { attributeValue } from '../../src/services/userPoolService.js';
import { withCognitoSdk } from './setup.js';

describe(
  'CognitoIdentityServiceProvider.adminInitiateAuth',
  withCognitoSdk((Cognito) => {
    it('throws for missing user', async () => {
      const client = Cognito();

      const upc = await client.createUserPoolClient({
        UserPoolId: 'test',
        ClientName: 'test',
      });

      await expect(
        client.adminInitiateAuth({
          UserPoolId: 'test',
          ClientId: upc.UserPoolClient?.ClientId,
          AuthFlow: 'ADMIN_USER_PASSWORD_AUTH',
          AuthParameters: {
            USERNAME: 'example@example.com',
            PASSWORD: 'def',
          },
        })
      ).rejects.toMatchObject({
        message: 'User not authorized',
      });
    });

    it('handles users with UNCONFIRMED status', async () => {
      const client = Cognito();

      const upc = await client.createUserPoolClient({
        UserPoolId: 'test',
        ClientName: 'test',
      });

      await client.signUp({
        ClientId: upc.UserPoolClient?.ClientId,
        Password: 'def',
        UserAttributes: [{ Name: 'email', Value: 'example@example.com' }],
        Username: 'abc',
      });

      await expect(
        client.adminInitiateAuth({
          UserPoolId: 'test',
          ClientId: upc.UserPoolClient?.ClientId,
          AuthFlow: 'ADMIN_USER_PASSWORD_AUTH',
          AuthParameters: {
            USERNAME: 'abc',
            PASSWORD: 'def',
          },
        })
      ).rejects.toEqual(new UserNotConfirmedException());
    });

    it('can authenticate users with ADMIN_USER_PASSWORD_AUTH auth flow', async () => {
      const client = Cognito();

      const upc = await client.createUserPoolClient({
        UserPoolId: 'test',
        ClientName: 'test',
      });

      const createUserResponse = await client.adminCreateUser({
        DesiredDeliveryMediums: ['EMAIL'],
        TemporaryPassword: 'def',
        UserAttributes: [
          { Name: 'email', Value: 'example@example.com' },
          { Name: 'email_verified', Value: 'true' },
        ],
        Username: 'abc',
        UserPoolId: 'test',
      });
      const userSub = attributeValue('sub', createUserResponse.User?.Attributes);

      const response = await client.adminInitiateAuth({
        UserPoolId: 'test',
        ClientId: upc.UserPoolClient?.ClientId,
        AuthFlow: 'ADMIN_USER_PASSWORD_AUTH',
        AuthParameters: {
          USERNAME: 'abc',
          PASSWORD: 'def',
        },
      });

      expect(jwt.decode(response.AuthenticationResult?.AccessToken as string)).toEqual({
        auth_time: expect.any(Number),
        client_id: upc.UserPoolClient?.ClientId,
        event_id: expect.stringMatching(UUID),
        exp: expect.any(Number),
        iat: expect.any(Number),
        iss: 'http://localhost:9229/test',
        jti: expect.stringMatching(UUID),
        scope: 'aws.cognito.signin.user.admin',
        sub: userSub,
        token_use: 'access',
        username: 'abc',
      });

      expect(jwt.decode(response.AuthenticationResult?.IdToken as string)).toEqual({
        'cognito:username': 'abc',
        aud: upc.UserPoolClient?.ClientId,
        auth_time: expect.any(Number),
        email: 'example@example.com',
        email_verified: true,
        event_id: expect.stringMatching(UUID),
        exp: expect.any(Number),
        iat: expect.any(Number),
        iss: 'http://localhost:9229/test',
        jti: expect.stringMatching(UUID),
        sub: userSub,
        token_use: 'id',
      });

      expect(jwt.decode(response.AuthenticationResult?.RefreshToken as string)).toEqual({
        'cognito:username': 'abc',
        email: 'example@example.com',
        exp: expect.any(Number),
        iat: expect.any(Number),
        iss: 'http://localhost:9229/test',
        jti: expect.stringMatching(UUID),
      });
    });

    it('can authenticate users with REFRESH_TOKEN_AUTH auth flow', async () => {
      const client = Cognito();

      const upc = await client.createUserPoolClient({
        UserPoolId: 'test',
        ClientName: 'test',
      });

      const createUserResponse = await client.adminCreateUser({
        DesiredDeliveryMediums: ['EMAIL'],
        TemporaryPassword: 'def',
        UserAttributes: [
          { Name: 'email', Value: 'example@example.com' },
          { Name: 'email_verified', Value: 'true' },
        ],
        Username: 'abc',
        UserPoolId: 'test',
      });
      const userSub = attributeValue('sub', createUserResponse.User?.Attributes);

      const initialLoginResponse = await client.adminInitiateAuth({
        UserPoolId: 'test',
        ClientId: upc.UserPoolClient?.ClientId,
        AuthFlow: 'ADMIN_USER_PASSWORD_AUTH',
        AuthParameters: {
          USERNAME: 'abc',
          PASSWORD: 'def',
        },
      });

      const refreshTokenLoginResponse = await client.adminInitiateAuth({
        UserPoolId: 'test',
        ClientId: upc.UserPoolClient?.ClientId,
        AuthFlow: 'REFRESH_TOKEN_AUTH',
        AuthParameters: {
          REFRESH_TOKEN: initialLoginResponse.AuthenticationResult?.RefreshToken as string,
        },
      });

      expect(
        jwt.decode(refreshTokenLoginResponse.AuthenticationResult?.AccessToken as string)
      ).toEqual({
        auth_time: expect.any(Number),
        client_id: upc.UserPoolClient?.ClientId,
        event_id: expect.stringMatching(UUID),
        exp: expect.any(Number),
        iat: expect.any(Number),
        iss: 'http://localhost:9229/test',
        jti: expect.stringMatching(UUID),
        scope: 'aws.cognito.signin.user.admin',
        sub: userSub,
        token_use: 'access',
        username: 'abc',
      });

      expect(jwt.decode(refreshTokenLoginResponse.AuthenticationResult?.IdToken as string)).toEqual(
        {
          'cognito:username': 'abc',
          aud: upc.UserPoolClient?.ClientId,
          auth_time: expect.any(Number),
          email: 'example@example.com',
          email_verified: true,
          event_id: expect.stringMatching(UUID),
          exp: expect.any(Number),
          iat: expect.any(Number),
          iss: 'http://localhost:9229/test',
          jti: expect.stringMatching(UUID),
          sub: userSub,
          token_use: 'id',
        }
      );

      expect(refreshTokenLoginResponse.AuthenticationResult?.RefreshToken).not.toBeDefined();
    });
  })
);
