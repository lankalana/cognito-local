import { ClockFake } from '../../src/__tests__/clockFake.js';
import { withCognitoSdk } from './setup.js';

const originalDate = new Date();
const roundedDate = new Date(originalDate.getTime());
roundedDate.setMilliseconds(0);

const clock = new ClockFake(originalDate);

describe(
  'CognitoIdentityServiceProvider.listUsersInGroup',
  withCognitoSdk(
    (Cognito) => {
      it('lists users in a group', async () => {
        const client = Cognito();

        await client.createGroup({
          GroupName: 'group-1',
          UserPoolId: 'test',
        });

        const createUserResponse = await client.adminCreateUser({
          DesiredDeliveryMediums: ['EMAIL'],
          TemporaryPassword: 'def',
          UserAttributes: [{ Name: 'email', Value: 'example+1@example.com' }],
          Username: 'user-1',
          UserPoolId: 'test',
        });

        await client.adminAddUserToGroup({
          Username: 'user-1',
          GroupName: 'group-1',
          UserPoolId: 'test',
        });

        const result = await client.listUsersInGroup({
          UserPoolId: 'test',
          GroupName: 'group-1',
        });

        expect(result.Users).toEqual([createUserResponse.User]);
      });

      it('lists no users in an empty group', async () => {
        const client = Cognito();

        await client.createGroup({
          GroupName: 'group-2',
          UserPoolId: 'test',
        });

        const result = await client.listUsersInGroup({
          UserPoolId: 'test',
          GroupName: 'group-2',
        });

        expect(result.Users).toHaveLength(0);
      });
    },
    {
      clock,
    }
  )
);
