import { ClockFake } from "../../src/__tests__/clockFake.js";
import { withCognitoSdk } from "./setup.js";

const originalDate = new Date();
const roundedDate = new Date(originalDate.getTime());
roundedDate.setMilliseconds(0);

const clock = new ClockFake(originalDate);

describe(
  "CognitoIdentityServiceProvider.listGroups",
  withCognitoSdk(
    (Cognito) => {
      it("lists groups", async () => {
        const client = Cognito();

        await client.createGroup({
          GroupName: "abc",
          UserPoolId: "test1",
        });
        await client.createGroup({
          GroupName: "def",
          UserPoolId: "test1",
        });
        await client.createGroup({
          GroupName: "ghi",
          UserPoolId: "test2",
        });

        const result1 = await client.listGroups({
          UserPoolId: "test1",
        });

        expect(result1?.Groups).toEqual([
          {
            CreationDate: roundedDate,
            GroupName: "abc",
            LastModifiedDate: roundedDate,
            UserPoolId: "test1",
          },
          {
            CreationDate: roundedDate,
            GroupName: "def",
            LastModifiedDate: roundedDate,
            UserPoolId: "test1",
          },
        ]);

        const result2 = await client.listGroups({
          UserPoolId: "test2",
        });

        expect(result2?.Groups).toEqual([
          {
            CreationDate: roundedDate,
            GroupName: "ghi",
            LastModifiedDate: roundedDate,
            UserPoolId: "test2",
          },
        ]);
      });

      it("returns an empty collection when there are no groups", async () => {
        const client = Cognito();

        const result = await client.listGroups({
          UserPoolId: "test1",
        });

        expect(result?.Groups).toEqual([]);
      });

      // TODO: getUserPool lazily creates a pool right now, so we can't handle invalid user pools
      it.todo("handles invalid user pool");
    },
    {
      clock,
    },
  ),
);
