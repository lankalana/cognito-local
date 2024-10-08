import { ClockFake } from '../../src/__tests__/clockFake.js';
import { withCognitoSdk } from './setup.js';

const currentDate = new Date();
const roundedDate = new Date(currentDate.getTime());
roundedDate.setMilliseconds(0);

const clock = new ClockFake(currentDate);

describe(
  'CognitoIdentityServiceProvider.getIdentityProviderByIdentifier',
  withCognitoSdk(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (Cognito) => {
      it.todo('returns the correct identity provider');
    },
    {
      clock,
    }
  )
);
