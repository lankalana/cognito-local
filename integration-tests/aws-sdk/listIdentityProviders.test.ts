import { ClockFake } from "../../src/__tests__/clockFake";
import { withCognitoSdk } from "./setup";

const currentDate = new Date();
const roundedDate = new Date(currentDate.getTime());
roundedDate.setMilliseconds(0);

const clock = new ClockFake(currentDate);

describe(
  "CognitoIdentityServiceProvider.listIdentityProviders",
  withCognitoSdk(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (Cognito) => {
      it.todo("returns a list of identity providers");
    },
    {
      clock,
    },
  ),
);
