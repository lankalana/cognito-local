import { beforeEach, describe, expect, it, type MockedObject } from "vitest";
import { newMockCognitoService } from "../__tests__/mockCognitoService";
import { newMockUserPoolService } from "../__tests__/mockUserPoolService";
import { TestContext } from "../__tests__/testContext";
import * as TDB from "../__tests__/testDataBuilder";
import { InvalidParameterError } from "../errors";
import type { UserPoolService } from "../services";
import { ListUsers, type ListUsersTarget } from "./listUsers";

describe("ListUsers target", () => {
  let listUsers: ListUsersTarget;
  let mockUserPoolService: MockedObject<UserPoolService>;

  beforeEach(() => {
    mockUserPoolService = newMockUserPoolService();
    listUsers = ListUsers({
      cognito: newMockCognitoService(mockUserPoolService),
    });
  });

  it("lists users and removes Cognito Local fields", async () => {
    const user1 = TDB.user({ Username: "a" });
    const user2 = TDB.user({ Username: "b" });

    mockUserPoolService.listUsers.mockResolvedValue([user1, user2]);

    const output = await listUsers(TestContext, {
      UserPoolId: "userPoolId",
    });

    expect(output).toBeDefined();
    expect(output.Users).toEqual([
      {
        Attributes: user1.Attributes,
        Enabled: user1.Enabled,
        UserCreateDate: new Date(user1.UserCreateDate),
        UserLastModifiedDate: new Date(user1.UserLastModifiedDate),
        UserStatus: user1.UserStatus,
        Username: user1.Username,
      },
      {
        Attributes: user2.Attributes,
        Enabled: user2.Enabled,
        UserCreateDate: new Date(user2.UserCreateDate),
        UserLastModifiedDate: new Date(user2.UserLastModifiedDate),
        UserStatus: user2.UserStatus,
        Username: user2.Username,
      },
    ]);
  });

  it.todo("supports AttributesToGet to specify which attributes to return");

  it("supports Filter to filter users before returning", async () => {
    mockUserPoolService.listUsers.mockResolvedValue([]);

    const output = await listUsers(TestContext, {
      UserPoolId: "userPoolId",
      Filter: 'username = "abc"',
    });

    expect(output).toBeDefined();
    expect(output.Users).toEqual([]);

    expect(mockUserPoolService.listUsers).toHaveBeenCalledWith(TestContext, 'username = "abc"');
  });

  describe("pagination", () => {
    const users = ["charlie", "alice", "bob"].map((Username) => TDB.user({ Username }));

    const listAll = async (Limit?: number) => {
      const usernames: string[] = [];
      let PaginationToken: string | undefined;
      do {
        const output = await listUsers(TestContext, {
          UserPoolId: "userPoolId",
          Limit,
          PaginationToken,
        });
        usernames.push(...(output.Users ?? []).map((user) => user.Username!));
        PaginationToken = output.PaginationToken;
      } while (PaginationToken && usernames.length <= users.length);
      return usernames;
    };

    beforeEach(() => {
      mockUserPoolService.listUsers.mockResolvedValue(users);
    });

    it("returns all users sorted by username without a token when they fit on one page", async () => {
      const output = await listUsers(TestContext, { UserPoolId: "userPoolId" });

      expect(output.Users?.map((user) => user.Username)).toEqual(["alice", "bob", "charlie"]);
      expect(output.PaginationToken).toBeUndefined();
    });

    it.each([1, 2, 3])("pages through every user once with Limit %d", async (limit) => {
      expect(await listAll(limit)).toEqual(["alice", "bob", "charlie"]);
    });

    it("defaults to pages of 60 users", async () => {
      const many = Array.from({ length: 65 }, (_, i) =>
        TDB.user({ Username: `user-${String(i).padStart(2, "0")}` }),
      );
      mockUserPoolService.listUsers.mockResolvedValue(many);

      const first = await listUsers(TestContext, { UserPoolId: "userPoolId" });
      expect(first.Users).toHaveLength(60);

      const last = await listUsers(TestContext, {
        UserPoolId: "userPoolId",
        PaginationToken: first.PaginationToken,
      });
      expect(last.Users).toHaveLength(5);
      expect(last.PaginationToken).toBeUndefined();
    });

    it("neither skips nor duplicates users when users are deleted or added between pages", async () => {
      const first = await listUsers(TestContext, { UserPoolId: "userPoolId", Limit: 1 });
      expect(first.Users?.map((user) => user.Username)).toEqual(["alice"]);

      mockUserPoolService.listUsers.mockResolvedValue([
        TDB.user({ Username: "bob" }),
        TDB.user({ Username: "charlie" }),
        TDB.user({ Username: "aaron" }),
      ]);

      const second = await listUsers(TestContext, {
        UserPoolId: "userPoolId",
        Limit: 1,
        PaginationToken: first.PaginationToken,
      });
      expect(second.Users?.map((user) => user.Username)).toEqual(["bob"]);
    });

    it.each([-1, 61, 1.5, "1" as unknown as number])("rejects Limit %s", async (Limit) => {
      await expect(listUsers(TestContext, { UserPoolId: "userPoolId", Limit })).rejects.toEqual(
        new InvalidParameterError("Limit must be between 0 and 60"),
      );
    });

    it("rejects malformed tokens and tokens issued for another pool or filter", async () => {
      const { PaginationToken } = await listUsers(TestContext, {
        UserPoolId: "userPoolId",
        Limit: 1,
      });

      for (const req of [
        { UserPoolId: "userPoolId", PaginationToken: "invalid" },
        { UserPoolId: "userPoolId", PaginationToken: Buffer.from("null").toString("base64url") },
        { UserPoolId: "otherPool", PaginationToken },
        { UserPoolId: "userPoolId", Filter: 'username = "bob"', PaginationToken },
      ]) {
        await expect(listUsers(TestContext, req)).rejects.toEqual(
          new InvalidParameterError("Invalid pagination token"),
        );
      }
    });
  });
});
