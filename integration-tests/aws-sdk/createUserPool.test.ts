import { ClockFake } from "../../src/__tests__/clockFake.js";
import { USER_POOL_AWS_DEFAULTS } from "../../src/services/cognitoService.js";
import { withCognitoSdk } from "./setup.js";

const currentDate = new Date();
const roundedDate = new Date(currentDate.getTime());
roundedDate.setMilliseconds(0);

const clock = new ClockFake(currentDate);

describe(
  "CognitoIdentityServiceProvider.createUserPool",
  withCognitoSdk(
    (Cognito) => {
      it("creates a user pool with only the required parameters", async () => {
        const client = Cognito();

        const result = await client.createUserPool({
          PoolName: "test",
        });

        expect(result?.UserPool).toEqual({
          ...USER_POOL_AWS_DEFAULTS,
          Arn: expect.stringMatching(
            /^arn:aws:cognito-idp:local:local:userpool\/local_[\w\d]{8}$/,
          ),
          CreationDate: roundedDate,
          Id: expect.stringMatching(/^local_[\w\d]{8}$/),
          LastModifiedDate: roundedDate,
          Name: "test",
        });
      });
    },
    {
      clock,
    },
  ),
);
