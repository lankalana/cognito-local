import { ClockFake } from '../__tests__/clockFake.js';
import { newMockCognitoService } from '../__tests__/mockCognitoService.js';
import { newMockUserPoolService } from '../__tests__/mockUserPoolService.js';
import { TestContext } from '../__tests__/testContext.js';
import * as TDB from '../__tests__/testDataBuilder.js';
import { UserNotFoundError } from '../errors.js';
import { UserPoolService } from '../services/index.js';
import { AdminDisableUser, AdminDisableUserTarget } from './adminDisableUser.js';

const originalDate = new Date();

describe('AdminDisableUser target', () => {
  let adminDisableUser: AdminDisableUserTarget;
  let mockUserPoolService: jest.Mocked<UserPoolService>;
  let clock: ClockFake;

  beforeEach(() => {
    mockUserPoolService = newMockUserPoolService();
    clock = new ClockFake(originalDate);

    adminDisableUser = AdminDisableUser({
      clock,
      cognito: newMockCognitoService(mockUserPoolService),
    });
  });

  it('enables the user', async () => {
    const existingUser = TDB.user();

    mockUserPoolService.getUserByUsername.mockResolvedValue(existingUser);

    const newDate = new Date();
    clock.advanceTo(newDate);

    await adminDisableUser(TestContext, {
      Username: existingUser.Username,
      UserPoolId: 'test',
    });

    expect(mockUserPoolService.saveUser).toHaveBeenCalledWith(TestContext, {
      ...existingUser,
      UserLastModifiedDate: newDate,
      Enabled: false,
    });
  });

  it("throws if the user doesn't exist", async () => {
    await expect(
      adminDisableUser(TestContext, {
        Username: 'user',
        UserPoolId: 'test',
      })
    ).rejects.toEqual(new UserNotFoundError());
  });
});
