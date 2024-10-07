import { withCognitoSdk } from './setup.js';

describe(
  'CognitoIdentityServiceProvider.listUserPools',
  withCognitoSdk((Cognito) => {
    it('lists user pools', async () => {
      const client = Cognito();

      await client.createUserPool({
        PoolName: 'test-1',
      });
      await client.createUserPool({
        PoolName: 'test-2',
      });
      await client.createUserPool({
        PoolName: 'test-3',
      });

      const result = await client.listUserPools({
        MaxResults: 10,
      });

      expect(result.UserPools).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ Name: 'test-1' }),
          expect.objectContaining({ Name: 'test-2' }),
          expect.objectContaining({ Name: 'test-3' }),
        ])
      );
    });
  })
);
