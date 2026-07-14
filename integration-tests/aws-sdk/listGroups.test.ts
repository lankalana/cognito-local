import { describe, expect, it } from "vitest";
import { ClockFake } from "../../src/__tests__/clockFake";
import { withCognitoSdk } from "./setup";

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

        const pool1 = await client.createUserPool({
          PoolName: "test 1",
        });
        const userPool1Id = pool1.UserPool!.Id!;
        const pool2 = await client.createUserPool({
          PoolName: "test 2",
        });
        const userPool2Id = pool2.UserPool!.Id!;

        await client.createGroup({
          GroupName: "abc",
          UserPoolId: userPool1Id,
        });
        await client.createGroup({
          GroupName: "def",
          UserPoolId: userPool1Id,
        });
        await client.createGroup({
          GroupName: "ghi",
          UserPoolId: userPool2Id,
        });

        const result1 = await client.listGroups({
          UserPoolId: userPool1Id,
        });

        expect(result1).toEqual({
          $metadata: result1.$metadata,
          Groups: [
            {
              CreationDate: roundedDate,
              GroupName: "abc",
              LastModifiedDate: roundedDate,
              UserPoolId: userPool1Id,
            },
            {
              CreationDate: roundedDate,
              GroupName: "def",
              LastModifiedDate: roundedDate,
              UserPoolId: userPool1Id,
            },
          ],
        });

        const result2 = await client.listGroups({
          UserPoolId: userPool2Id,
        });

        expect(result2).toEqual({
          $metadata: result2.$metadata,
          Groups: [
            {
              CreationDate: roundedDate,
              GroupName: "ghi",
              LastModifiedDate: roundedDate,
              UserPoolId: userPool2Id,
            },
          ],
        });

        expect(result1?.Groups).toEqual([
          {
            CreationDate: roundedDate,
            GroupName: "abc",
            LastModifiedDate: roundedDate,
            UserPoolId: userPool1Id,
          },
          {
            CreationDate: roundedDate,
            GroupName: "def",
            LastModifiedDate: roundedDate,
            UserPoolId: userPool1Id,
          },
        ]);
      });

      it("returns an empty collection when there are no groups", async () => {
        const client = Cognito();

        const pool = await client.createUserPool({
          PoolName: "test",
        });
        const userPoolId = pool.UserPool!.Id!;

        const result = await client.listGroups({
          UserPoolId: userPoolId,
        });

        expect(result).toEqual({
          $metadata: result.$metadata,
          Groups: [],
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
