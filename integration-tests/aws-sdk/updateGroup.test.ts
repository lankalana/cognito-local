import { withCognitoSdk } from './setup.js';

describe(
  'CognitoIdentityServiceProvider.updateGroup',
  withCognitoSdk((Cognito) => {
    it('updates a group', async () => {
      const client = Cognito();

      await client.createGroup({
        GroupName: 'abc',
        UserPoolId: 'test',
        Description: 'original description',
      });

      const getGroupResponse = await client.getGroup({
        GroupName: 'abc',
        UserPoolId: 'test',
      });

      expect(getGroupResponse.Group).toMatchObject({
        GroupName: 'abc',
        Description: 'original description',
      });

      await client.updateGroup({
        GroupName: 'abc',
        UserPoolId: 'test',
        Description: 'new description',
      });

      const getGroupResponseAfterUpdate = await client.getGroup({
        GroupName: 'abc',
        UserPoolId: 'test',
      });

      expect(getGroupResponseAfterUpdate.Group).toMatchObject({
        GroupName: 'abc',
        Description: 'new description',
      });
    });
  })
);
