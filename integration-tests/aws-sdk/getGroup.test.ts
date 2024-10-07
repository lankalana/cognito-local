import { ClockFake } from '../../src/__tests__/clockFake.js';
import { withCognitoSdk } from './setup.js';

const currentDate = new Date();
const roundedDate = new Date(currentDate.getTime());
roundedDate.setMilliseconds(0);

const clock = new ClockFake(currentDate);

describe(
  'CognitoIdentityServiceProvider.getGroup',
  withCognitoSdk(
    (Cognito) => {
      it('get a group', async () => {
        const client = Cognito();

        await client.createGroup({
          Description: 'Description',
          GroupName: 'abc',
          Precedence: 1,
          RoleArn: 'arn',
          UserPoolId: 'test',
        });

        const getGroupResponse = await client.getGroup({
          GroupName: 'abc',
          UserPoolId: 'test',
        });

        expect(getGroupResponse.Group).toEqual({
          CreationDate: roundedDate,
          Description: 'Description',
          GroupName: 'abc',
          LastModifiedDate: roundedDate,
          Precedence: 1,
          RoleArn: 'arn',
          UserPoolId: 'test',
        });
      });
    },
    {
      clock,
    }
  )
);
