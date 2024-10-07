import { newMockCognitoService } from "../../__tests__/mockCognitoService.js";
import { newMockLambda } from "../../__tests__/mockLambda.js";
import { newMockUserPoolService } from "../../__tests__/mockUserPoolService.js";
import { UUID } from "../../__tests__/patterns.js";
import { TestContext } from "../../__tests__/testContext.js";
import { NotAuthorizedError } from "../../errors.js";
import { DateClock } from "../clock.js";
import { Lambda } from "../lambda.js";
import { UserPoolService } from "../userPoolService.js";
import { UserMigration, UserMigrationTrigger } from "./userMigration.js";

describe("UserMigration trigger", () => {
  let mockLambda: jest.Mocked<Lambda>;
  let mockUserPoolService: jest.Mocked<UserPoolService>;
  let userMigration: UserMigrationTrigger;

  beforeEach(() => {
    mockLambda = newMockLambda();
    mockUserPoolService = newMockUserPoolService();
    userMigration = UserMigration({
      clock: new DateClock(),
      cognitoClient: newMockCognitoService(mockUserPoolService),
      lambda: mockLambda,
    });
  });

  describe("when lambda invoke fails", () => {
    it("throws unauthorized error", async () => {
      mockLambda.invoke.mockRejectedValue(new Error("Something bad happened"));

      await expect(
        userMigration(TestContext, {
          clientId: "clientId",
          clientMetadata: undefined,
          password: "password",
          userAttributes: [],
          username: "username",
          userPoolId: "userPoolId",
          validationData: undefined,
        }),
      ).rejects.toBeInstanceOf(NotAuthorizedError);
    });
  });

  describe("when lambda invoke succeeds", () => {
    it("saves user with attributes from response", async () => {
      mockLambda.invoke.mockResolvedValue({
        userAttributes: {
          email: "example@example.com",
        },
      });

      const user = await userMigration(TestContext, {
        clientMetadata: {
          client: "metadata",
        },
        userPoolId: "userPoolId",
        clientId: "clientId",
        username: "example@example.com", // username may be an email when migration is from a login attempt
        password: "password",
        userAttributes: [], // there won't be any attributes yet because we don't know who the user is
        validationData: {
          validation: "data",
        },
      });

      expect(mockLambda.invoke).toHaveBeenCalledWith(
        TestContext,
        "UserMigration",
        {
          clientId: "clientId",
          clientMetadata: {
            client: "metadata",
          },
          password: "password",
          triggerSource: "UserMigration_Authentication",
          userAttributes: {},
          userPoolId: "userPoolId",
          username: "example@example.com",
          validationData: {
            validation: "data",
          },
        },
      );

      expect(user).not.toBeNull();
      expect(user.Username).toEqual(expect.stringMatching(UUID));
      expect(user.Password).toEqual("password");
      expect(user.Attributes).toContainEqual({
        Name: "email",
        Value: "example@example.com",
      });
      expect(user.UserStatus).toEqual("CONFIRMED");
    });

    it("uses username from response if present", async () => {
      mockLambda.invoke.mockResolvedValue({
        userAttributes: {
          email: "example@example.com",
          username: "thisuser",
        },
      });

      const user = await userMigration(TestContext, {
        clientMetadata: {
          client: "metadata",
        },
        userPoolId: "userPoolId",
        clientId: "clientId",
        username: "example@example.com", // username may be an email when migration is from a login attempt
        password: "password",
        userAttributes: [], // there won't be any attributes yet because we don't know who the user is
        validationData: {
          validation: "data",
        },
      });

      expect(mockLambda.invoke).toBeCalled();
      expect(user).not.toBeNull();
      expect(user.Username).toEqual("thisuser");
    });

    it("sets user to RESET_REQUIRED if finalUserStatus is RESET_REQUIRED in response", async () => {
      mockLambda.invoke.mockResolvedValue({
        finalUserStatus: "RESET_REQUIRED",
      });

      const user = await userMigration(TestContext, {
        clientId: "clientId",
        clientMetadata: undefined,
        password: "password",
        userAttributes: [],
        username: "example@example.com",
        userPoolId: "userPoolId",
        validationData: undefined,
      });

      expect(user).not.toBeNull();
      expect(user.UserStatus).toEqual("RESET_REQUIRED");
    });
  });
});
