import { ClockFake } from "../../src/__tests__/clockFake.js";
import { withCognitoSdk } from "./setup.js";

const currentDate = new Date();
const roundedDate = new Date(currentDate.getTime());
roundedDate.setMilliseconds(0);

const clock = new ClockFake(currentDate);

describe(
  "CognitoIdentityServiceProvider.adminSetUserPassword",
  withCognitoSdk(
    (Cognito) => {
      it("sets a permanent password", async () => {
        const client = Cognito();

        // create the user
        const createUserResult = await client.adminCreateUser({
          UserAttributes: [{ Name: "phone_number", Value: "0400000000" }],
          Username: "abc",
          UserPoolId: "test",
        });

        await client.adminSetUserPassword({
          Username: "abc",
          UserPoolId: "test",
          Password: "newPassword",
          Permanent: true,
        });

        // verify they exist
        const result = await client.adminGetUser({
          Username: "abc",
          UserPoolId: "test",
        });

        expect(result).toEqual({
          $metadata: result.$metadata,
          Enabled: true,
          UserAttributes: createUserResult.User?.Attributes,
          UserCreateDate: createUserResult.User?.UserCreateDate,
          UserLastModifiedDate: createUserResult.User?.UserLastModifiedDate,
          Username: createUserResult.User?.Username,
          UserStatus: "CONFIRMED",
        });
      });
    },
    {
      clock,
    },
  ),
);
