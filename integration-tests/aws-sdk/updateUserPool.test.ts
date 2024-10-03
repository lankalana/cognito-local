import { withCognitoSdk } from "./setup";

describe(
  "CognitoIdentityServiceProvider.updateUserPool",
  withCognitoSdk((Cognito) => {
    it("updates a user pool", async () => {
      const client = Cognito();

      // create the user pool client
      const up = await client
        .createUserPool({
          PoolName: "pool",
          MfaConfiguration: "OFF",
        });

      const describeResponse = await client
        .describeUserPool({
          UserPoolId: up.UserPool?.Id!,
        });

      expect(describeResponse.UserPool).toMatchObject({
        Name: "pool",
        MfaConfiguration: "OFF",
      });

      await client
        .updateUserPool({
          UserPoolId: up.UserPool?.Id!,
          MfaConfiguration: "OPTIONAL",
        });

      const describeResponseAfterUpdate = await client
        .describeUserPool({
          UserPoolId: up.UserPool?.Id!,
        });

      expect(describeResponseAfterUpdate.UserPool).toMatchObject({
        Name: "pool",
        MfaConfiguration: "OPTIONAL",
      });
    });
  })
);
