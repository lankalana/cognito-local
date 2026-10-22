import { describe, expect, it } from "vitest";
import { UUID } from "../../src/__tests__/patterns";
import { withCognitoSdk } from "./setup";

describe(
  "CognitoIdentityServiceProvider.listUsers",
  withCognitoSdk((Cognito) => {
    describe("without any username attributes configured on the user pool", () => {
      it("lists users", async () => {
        const client = Cognito();

        const pool = await client.createUserPool({
          PoolName: "test",
        });
        const userPoolId = pool.UserPool!.Id!;

        const createUserResult = await client.adminCreateUser({
          UserAttributes: [{ Name: "phone_number", Value: "0400000000" }],
          Username: "abc",
          UserPoolId: userPoolId,
        });

        const result = await client.listUsers({
          UserPoolId: userPoolId,
        });

        expect(result).toEqual({
          $metadata: result.$metadata,
          Users: [
            {
              Attributes: createUserResult.User?.Attributes,
              Enabled: true,
              UserCreateDate: createUserResult.User?.UserCreateDate,
              UserLastModifiedDate: createUserResult.User?.UserLastModifiedDate,
              UserStatus: "FORCE_CHANGE_PASSWORD",
              Username: "abc",
            },
          ],
        });
      });

      it("filters users", async () => {
        const client = Cognito();

        const pool = await client.createUserPool({
          PoolName: "test",
        });
        const userPoolId = pool.UserPool!.Id!;

        await client.adminCreateUser({
          UserAttributes: [{ Name: "phone_number", Value: "0400000000" }],
          Username: "abc1",
          UserPoolId: userPoolId,
        });

        const createUserResult2 = await client.adminCreateUser({
          UserAttributes: [{ Name: "phone_number", Value: "0500000000" }],
          Username: "abc2",
          UserPoolId: userPoolId,
        });

        const result = await client.listUsers({
          UserPoolId: userPoolId,
          Filter: 'phone_number ^= "05"',
        });

        expect(result).toEqual({
          $metadata: result.$metadata,
          Users: [
            {
              Attributes: createUserResult2.User?.Attributes,
              Enabled: true,
              UserCreateDate: createUserResult2.User?.UserCreateDate,
              UserLastModifiedDate: createUserResult2.User?.UserLastModifiedDate,
              UserStatus: "FORCE_CHANGE_PASSWORD",
              Username: "abc2",
            },
          ],
        });
      });

      it("paginates filtered users", async () => {
        const client = Cognito();

        const pool = await client.createUserPool({
          PoolName: "test",
        });
        const userPoolId = pool.UserPool!.Id!;

        for (const [Username, email] of [
          ["c", "ALICE3@example.com"],
          ["a", "alice1@example.com"],
          ["x", "bob@example.com"],
          ["b", "Alice2@example.com"],
        ]) {
          await client.adminCreateUser({
            UserAttributes: [{ Name: "email", Value: email }],
            DesiredDeliveryMediums: ["EMAIL"],
            Username,
            UserPoolId: userPoolId,
          });
        }

        const usernames: string[] = [];
        let PaginationToken: string | undefined;
        do {
          const result = await client.listUsers({
            UserPoolId: userPoolId,
            Filter: '"email"^="alice"',
            Limit: 2,
            PaginationToken,
          });
          usernames.push(...result.Users!.map((user) => user.Username!));
          PaginationToken = result.PaginationToken;
        } while (PaginationToken);

        expect(usernames).toEqual(["a", "b", "c"]);
      });

      it("handles no users", async () => {
        const client = Cognito();

        const pool = await client.createUserPool({
          PoolName: "test",
        });
        const userPoolId = pool.UserPool!.Id!;

        const result = await client.listUsers({
          UserPoolId: userPoolId,
        });

        expect(result).toEqual({
          $metadata: result.$metadata,
          Users: [],
        });
      });
    });

    describe("with email configured as a username attribute on the user pool", () => {
      it("lists users", async () => {
        const client = Cognito();

        const pool = await client.createUserPool({
          PoolName: "test",
          UsernameAttributes: ["email"],
        });
        const userPoolId = pool.UserPool!.Id!;

        const createUserResult = await client.adminCreateUser({
          UserAttributes: [{ Name: "phone_number", Value: "0400000000" }],
          Username: "example@example.com",
          UserPoolId: userPoolId,
        });

        const result = await client.listUsers({
          UserPoolId: userPoolId,
        });

        expect(result).toEqual({
          $metadata: result.$metadata,
          Users: [
            {
              Attributes: createUserResult.User?.Attributes,
              Enabled: true,
              UserCreateDate: createUserResult.User?.UserCreateDate,
              UserLastModifiedDate: createUserResult.User?.UserLastModifiedDate,
              UserStatus: "FORCE_CHANGE_PASSWORD",
              Username: expect.stringMatching(UUID),
            },
          ],
        });
      });
    });
  }),
);
