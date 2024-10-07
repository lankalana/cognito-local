import { ClockFake } from '../__tests__/clockFake.js';
import { newMockCognitoService } from '../__tests__/mockCognitoService.js';
import { newMockTriggers } from '../__tests__/mockTriggers.js';
import { newMockUserPoolService } from '../__tests__/mockUserPoolService.js';
import { TestContext } from '../__tests__/testContext.js';
import * as TDB from '../__tests__/testDataBuilder.js';
import { CodeMismatchError, UserNotFoundError } from '../errors.js';
import { Triggers, UserPoolService } from '../services/index.js';
import { attribute, attributesAppend } from '../services/userPoolService.js';
import { ConfirmForgotPassword, ConfirmForgotPasswordTarget } from './confirmForgotPassword.js';

const currentDate = new Date();

describe('ConfirmForgotPassword target', () => {
  let confirmForgotPassword: ConfirmForgotPasswordTarget;
  let mockUserPoolService: jest.Mocked<UserPoolService>;
  let mockTriggers: jest.Mocked<Triggers>;

  let clock: ClockFake;

  beforeEach(() => {
    clock = new ClockFake(currentDate);

    mockUserPoolService = newMockUserPoolService();
    mockTriggers = newMockTriggers();
    confirmForgotPassword = ConfirmForgotPassword({
      clock,
      cognito: newMockCognitoService(mockUserPoolService),
      triggers: mockTriggers,
    });
  });

  it("throws if user doesn't exist", async () => {
    mockUserPoolService.getUserByUsername.mockResolvedValue(null);

    await expect(
      confirmForgotPassword(TestContext, {
        ClientId: 'clientId',
        Username: 'janice',
        ConfirmationCode: '123456',
        Password: 'newPassword',
      })
    ).rejects.toBeInstanceOf(UserNotFoundError);
  });

  it("throws if confirmation code doesn't match stored value", async () => {
    const user = TDB.user({
      ConfirmationCode: '456789',
      UserStatus: 'UNCONFIRMED',
    });

    mockUserPoolService.getUserByUsername.mockResolvedValue(user);

    await expect(
      confirmForgotPassword(TestContext, {
        ClientId: 'clientId',
        Username: 'janice',
        ConfirmationCode: '123456',
        Password: 'newPassword',
      })
    ).rejects.toBeInstanceOf(CodeMismatchError);
  });

  describe('when code matches', () => {
    it("updates the user's password", async () => {
      const user = TDB.user({
        ConfirmationCode: '456789',
        UserStatus: 'UNCONFIRMED',
      });

      mockUserPoolService.getUserByUsername.mockResolvedValue(user);

      // advance the time so we can see the last modified timestamp change
      const newNow = clock.advanceBy(5000);

      await confirmForgotPassword(TestContext, {
        ClientId: 'clientId',
        Username: user.Username,
        ConfirmationCode: '456789',
        Password: 'newPassword',
      });

      expect(mockUserPoolService.saveUser).toHaveBeenCalledWith(TestContext, {
        ...user,
        ConfirmationCode: undefined,
        Password: 'newPassword',
        UserLastModifiedDate: newNow,
        UserStatus: 'CONFIRMED',
      });
    });

    describe('when PostConfirmation trigger configured', () => {
      it('invokes the trigger', async () => {
        mockTriggers.enabled.mockReturnValue(true);

        const user = TDB.user({
          ConfirmationCode: '456789',
          UserStatus: 'UNCONFIRMED',
        });

        mockUserPoolService.getUserByUsername.mockResolvedValue(user);

        await confirmForgotPassword(TestContext, {
          ClientId: 'clientId',
          ClientMetadata: {
            client: 'metadata',
          },
          Username: user.Username,
          ConfirmationCode: '456789',
          Password: 'newPassword',
        });

        expect(mockTriggers.postConfirmation).toHaveBeenCalledWith(TestContext, {
          clientId: 'clientId',
          clientMetadata: {
            client: 'metadata',
          },
          source: 'PostConfirmation_ConfirmForgotPassword',
          userAttributes: attributesAppend(
            user.Attributes,
            attribute('cognito:user_status', 'CONFIRMED')
          ),
          userPoolId: 'test',
          username: user.Username,
        });
      });
    });

    describe('when PostConfirmation trigger not configured', () => {
      it("doesn't invoke the trigger", async () => {
        mockTriggers.enabled.mockReturnValue(false);

        const user = TDB.user({
          ConfirmationCode: '456789',
          UserStatus: 'UNCONFIRMED',
        });

        mockUserPoolService.getUserByUsername.mockResolvedValue(user);

        await confirmForgotPassword(TestContext, {
          ClientId: 'clientId',
          Username: user.Username,
          ConfirmationCode: '456789',
          Password: 'newPassword',
        });

        expect(mockTriggers.postConfirmation).not.toHaveBeenCalled();
      });
    });
  });
});
