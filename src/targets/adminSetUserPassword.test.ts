import { ClockFake } from '../__tests__/clockFake.js';
import { newMockCognitoService } from '../__tests__/mockCognitoService.js';
import { newMockUserPoolService } from '../__tests__/mockUserPoolService.js';
import { TestContext } from '../__tests__/testContext.js';
import * as TDB from '../__tests__/testDataBuilder.js';
import { UserNotFoundError } from '../errors.js';
import { UserPoolService } from '../services/index.js';
import { AdminSetUserPassword, AdminSetUserPasswordTarget } from './adminSetUserPassword.js';

describe('AdminSetUser target', () => {
  let adminSetUserPassword: AdminSetUserPasswordTarget;
  let mockUserPoolService: jest.Mocked<UserPoolService>;
  let clock: ClockFake;

  beforeEach(() => {
    mockUserPoolService = newMockUserPoolService();
    clock = new ClockFake(new Date());
    adminSetUserPassword = AdminSetUserPassword({
      cognito: newMockCognitoService(mockUserPoolService),
      clock,
    });
  });

  it('sets a new temporary password by default', async () => {
    const existingUser = TDB.user();

    mockUserPoolService.getUserByUsername.mockResolvedValue(existingUser);

    const newDate = clock.advanceBy(1200);

    await adminSetUserPassword(TestContext, {
      Username: existingUser.Username,
      UserPoolId: 'test',
      Password: 'newPassword',
    });

    expect(mockUserPoolService.saveUser).toHaveBeenCalledWith(TestContext, {
      ...existingUser,
      Password: 'newPassword',
      UserLastModifiedDate: newDate,
      UserStatus: 'FORCE_CHANGE_PASSWORD',
    });
  });

  it('sets a new temporary password explicitly', async () => {
    const existingUser = TDB.user();

    mockUserPoolService.getUserByUsername.mockResolvedValue(existingUser);

    const newDate = clock.advanceBy(1200);

    await adminSetUserPassword(TestContext, {
      Username: existingUser.Username,
      UserPoolId: 'test',
      Password: 'newPassword',
      Permanent: false,
    });

    expect(mockUserPoolService.saveUser).toHaveBeenCalledWith(TestContext, {
      ...existingUser,
      Password: 'newPassword',
      UserLastModifiedDate: newDate,
      UserStatus: 'FORCE_CHANGE_PASSWORD',
    });
  });

  it('sets a permanent temporary password', async () => {
    const existingUser = TDB.user();

    mockUserPoolService.getUserByUsername.mockResolvedValue(existingUser);

    const newDate = clock.advanceBy(1200);

    await adminSetUserPassword(TestContext, {
      Username: existingUser.Username,
      UserPoolId: 'test',
      Password: 'newPassword',
      Permanent: true,
    });

    expect(mockUserPoolService.saveUser).toHaveBeenCalledWith(TestContext, {
      ...existingUser,
      Password: 'newPassword',
      UserLastModifiedDate: newDate,
      UserStatus: 'CONFIRMED',
    });
  });

  it('handles trying to set a password for an invalid user', async () => {
    mockUserPoolService.getUserByUsername.mockResolvedValue(null);

    await expect(
      adminSetUserPassword(TestContext, {
        Password: 'Password',
        Username: 'Username',
        UserPoolId: 'test',
      })
    ).rejects.toEqual(new UserNotFoundError('User does not exist'));
  });
});
