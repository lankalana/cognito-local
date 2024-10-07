import { withCognitoSdk } from './setup.js';

describe(
  'CognitoIdentityServiceProvider.getUserPoolMfaConfig',
  withCognitoSdk((Cognito) => {
    it('gets the user pool MFA config', async () => {
      const client = Cognito();

      const up = await client.createUserPool({
        PoolName: 'pool',
        MfaConfiguration: 'OPTIONAL',
        SmsAuthenticationMessage: 'hello, world!',
      });

      const getResponse = await client.getUserPoolMfaConfig({
        UserPoolId: up.UserPool?.Id,
      });

      expect(getResponse).toEqual({
        $metadata: getResponse.$metadata, // Don't care about the metadata
        MfaConfiguration: 'OPTIONAL',
        SmsMfaConfiguration: {
          SmsAuthenticationMessage: 'hello, world!',
        },
        SoftwareTokenMfaConfiguration: {
          Enabled: false,
        },
      });
    });
  })
);
