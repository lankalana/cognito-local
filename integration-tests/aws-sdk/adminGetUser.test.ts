import { ClockFake } from '../../src/__tests__/clockFake.js';
import { withCognitoSdk } from './setup.js';

const currentDate = new Date();
const roundedDate = new Date(currentDate.getTime());
roundedDate.setMilliseconds(0);

const clock = new ClockFake(currentDate);

describe(
  'CognitoIdentityServiceProvider.adminGetUser',
  withCognitoSdk(
    (Cognito) => {
      it('gets a user', async () => {
        const client = Cognito();

        // create the user
        const createUserResult = await client.adminCreateUser({
          UserAttributes: [{ Name: 'phone_number', Value: '0400000000' }],
          Username: 'abc',
          UserPoolId: 'test',
        });

        // verify they exist
        const result = await client.adminGetUser({
          Username: 'abc',
          UserPoolId: 'test',
        });

        expect(result).toEqual({
          $metadata: result.$metadata,
          Enabled: true,
          UserAttributes: createUserResult.User?.Attributes,
          UserCreateDate: createUserResult.User?.UserCreateDate,
          UserLastModifiedDate: createUserResult.User?.UserLastModifiedDate,
          Username: createUserResult.User?.Username,
          UserStatus: createUserResult.User?.UserStatus,
        });
      });
    },
    {
      clock,
    }
  )
);
