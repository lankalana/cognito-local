import { newMockCognitoService } from '../__tests__/mockCognitoService.js';
import { newMockUserPoolService } from '../__tests__/mockUserPoolService.js';
import { TestContext } from '../__tests__/testContext.js';
import * as TDB from '../__tests__/testDataBuilder.js';
import { GroupNotFoundError, UserNotFoundError } from '../errors.js';
import { UserPoolService } from '../services/index.js';
import {
  AdminRemoveUserFromGroup,
  AdminRemoveUserFromGroupTarget,
} from './adminRemoveUserFromGroup.js';

describe('AdminRemoveUserFromGroup target', () => {
  let adminRemoveUserFromGroup: AdminRemoveUserFromGroupTarget;
  let mockUserPoolService: jest.Mocked<UserPoolService>;

  beforeEach(() => {
    mockUserPoolService = newMockUserPoolService();

    adminRemoveUserFromGroup = AdminRemoveUserFromGroup({
      cognito: newMockCognitoService(mockUserPoolService),
    });
  });

  it('removes the user from a group', async () => {
    const existingUser = TDB.user();
    const existingGroup = TDB.group({
      members: ['other-user', existingUser.Username],
    });

    mockUserPoolService.getGroupByGroupName.mockResolvedValue(existingGroup);
    mockUserPoolService.getUserByUsername.mockResolvedValue(existingUser);

    await adminRemoveUserFromGroup(TestContext, {
      GroupName: existingGroup.GroupName,
      Username: existingUser.Username,
      UserPoolId: 'test',
    });

    expect(mockUserPoolService.removeUserFromGroup).toHaveBeenCalledWith(
      TestContext,
      existingGroup,
      existingUser
    );
  });

  it("throws if the group doesn't exist", async () => {
    const existingUser = TDB.user();

    mockUserPoolService.getGroupByGroupName.mockResolvedValue(null);
    mockUserPoolService.getUserByUsername.mockResolvedValue(existingUser);

    await expect(
      adminRemoveUserFromGroup(TestContext, {
        GroupName: 'group',
        Username: existingUser.Username,
        UserPoolId: 'test',
      })
    ).rejects.toEqual(new GroupNotFoundError());
  });

  it("throws if the user doesn't exist", async () => {
    const existingGroup = TDB.group();

    mockUserPoolService.getGroupByGroupName.mockResolvedValue(existingGroup);
    mockUserPoolService.getUserByUsername.mockResolvedValue(null);

    await expect(
      adminRemoveUserFromGroup(TestContext, {
        GroupName: existingGroup.GroupName,
        Username: 'user',
        UserPoolId: 'test',
      })
    ).rejects.toEqual(new UserNotFoundError());
  });
});
