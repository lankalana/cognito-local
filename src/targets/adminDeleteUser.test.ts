import { newMockCognitoService } from '../__tests__/mockCognitoService.js';
import { newMockUserPoolService } from '../__tests__/mockUserPoolService.js';
import { TestContext } from '../__tests__/testContext.js';
import * as TDB from '../__tests__/testDataBuilder.js';
import { UserNotFoundError } from '../errors.js';
import { UserPoolService } from '../services/index.js';
import { AdminDeleteUser, AdminDeleteUserTarget } from './adminDeleteUser.js';

describe('AdminDeleteUser target', () => {
  let adminDeleteUser: AdminDeleteUserTarget;
  let mockUserPoolService: jest.Mocked<UserPoolService>;

  beforeEach(() => {
    mockUserPoolService = newMockUserPoolService();
    adminDeleteUser = AdminDeleteUser({
      cognito: newMockCognitoService(mockUserPoolService),
    });
  });

  it('deletes the user', async () => {
    const existingUser = TDB.user();

    mockUserPoolService.getUserByUsername.mockResolvedValue(existingUser);

    await adminDeleteUser(TestContext, {
      Username: existingUser.Username,
      UserPoolId: 'test',
    });

    expect(mockUserPoolService.deleteUser).toHaveBeenCalledWith(TestContext, existingUser);
  });

  it('handles trying to delete an invalid user', async () => {
    const existingUser = TDB.user();

    mockUserPoolService.getUserByUsername.mockResolvedValue(null);

    await expect(
      adminDeleteUser(TestContext, {
        Username: existingUser.Username,
        UserPoolId: 'test',
      })
    ).rejects.toEqual(new UserNotFoundError('User does not exist'));
  });
});
