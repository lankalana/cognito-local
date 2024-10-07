import { UserStatusType } from "@aws-sdk/client-cognito-identity-provider";
import { ClockFake } from "../__tests__/clockFake.js";
import { newMockCognitoService } from "../__tests__/mockCognitoService.js";
import { newMockTriggers } from "../__tests__/mockTriggers.js";
import { newMockUserPoolService } from "../__tests__/mockUserPoolService.js";
import { TestContext } from "../__tests__/testContext.js";
import * as TDB from "../__tests__/testDataBuilder.js";
import { NotAuthorizedError } from "../errors.js";
import { Triggers, UserPoolService } from "../services/index.js";
import { attribute, attributesAppend } from "../services/userPoolService.js";
import {
  AdminConfirmSignUp,
  AdminConfirmSignUpTarget,
} from "./adminConfirmSignUp.js";

const currentDate = new Date();

const clock = new ClockFake(currentDate);

describe("AdminConfirmSignUp target", () => {
  let adminConfirmSignUp: AdminConfirmSignUpTarget;
  let mockUserPoolService: jest.Mocked<UserPoolService>;
  let mockTriggers: jest.Mocked<Triggers>;

  beforeEach(() => {
    mockUserPoolService = newMockUserPoolService();
    mockTriggers = newMockTriggers();
    adminConfirmSignUp = AdminConfirmSignUp({
      clock,
      cognito: newMockCognitoService(mockUserPoolService),
      triggers: mockTriggers,
    });
  });

  it("throws if the user doesn't exist", async () => {
    mockUserPoolService.getUserByUsername.mockResolvedValue(null);

    await expect(
      adminConfirmSignUp(TestContext, {
        ClientMetadata: {
          client: "metadata",
        },
        Username: "invalid user",
        UserPoolId: "test",
      }),
    ).rejects.toEqual(new NotAuthorizedError());
  });

  it.each([
    UserStatusType.CONFIRMED,
    UserStatusType.ARCHIVED,
    UserStatusType.COMPROMISED,
    UserStatusType.UNKNOWN,
    UserStatusType.RESET_REQUIRED,
    UserStatusType.FORCE_CHANGE_PASSWORD,
  ])("throws if the user has status %s", async (status) => {
    const user = TDB.user({
      UserStatus: status,
    });

    mockUserPoolService.getUserByUsername.mockResolvedValue(user);

    await expect(
      adminConfirmSignUp(TestContext, {
        ClientMetadata: {
          client: "metadata",
        },
        Username: user.Username,
        UserPoolId: "test",
      }),
    ).rejects.toEqual(
      new NotAuthorizedError(
        `User cannot be confirmed. Current status is ${status}`,
      ),
    );
  });

  it("updates the user's status", async () => {
    const user = TDB.user({
      UserStatus: "UNCONFIRMED",
    });

    mockUserPoolService.getUserByUsername.mockResolvedValue(user);

    await adminConfirmSignUp(TestContext, {
      ClientMetadata: {
        client: "metadata",
      },
      Username: user.Username,
      UserPoolId: "test",
    });

    expect(mockUserPoolService.saveUser).toHaveBeenCalledWith(TestContext, {
      ...user,
      UserLastModifiedDate: currentDate,
      UserStatus: "CONFIRMED",
    });
  });

  describe("when PostConfirmation trigger is enabled", () => {
    it("invokes the trigger", async () => {
      mockTriggers.enabled.mockImplementation(
        (trigger) => trigger === "PostConfirmation",
      );

      const user = TDB.user({
        UserStatus: "UNCONFIRMED",
      });

      mockUserPoolService.getUserByUsername.mockResolvedValue(user);

      await adminConfirmSignUp(TestContext, {
        ClientMetadata: {
          client: "metadata",
        },
        Username: user.Username,
        UserPoolId: "test",
      });

      expect(mockTriggers.postConfirmation).toHaveBeenCalledWith(TestContext, {
        clientId: null,
        clientMetadata: {
          client: "metadata",
        },
        source: "PostConfirmation_ConfirmSignUp",
        userAttributes: attributesAppend(
          user.Attributes,
          attribute("cognito:user_status", "CONFIRMED"),
        ),
        userPoolId: "test",
        username: user.Username,
      });
    });
  });

  describe("when PostConfirmation trigger is not enabled", () => {
    it("invokes the trigger", async () => {
      mockTriggers.enabled.mockReturnValue(false);

      const user = TDB.user({
        UserStatus: "UNCONFIRMED",
      });

      mockUserPoolService.getUserByUsername.mockResolvedValue(user);

      await adminConfirmSignUp(TestContext, {
        ClientMetadata: {
          client: "metadata",
        },
        Username: user.Username,
        UserPoolId: "test",
      });

      expect(mockTriggers.postConfirmation).not.toHaveBeenCalled();
    });
  });
});
