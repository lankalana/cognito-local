import { ClockFake } from '../__tests__/clockFake.js';
import { newMockCognitoService } from '../__tests__/mockCognitoService.js';
import { newMockUserPoolService } from '../__tests__/mockUserPoolService.js';
import { TestContext } from '../__tests__/testContext.js';
import * as TDB from '../__tests__/testDataBuilder.js';
import { GroupNotFoundError, UserNotFoundError } from '../errors.js';
import { UserPoolService } from '../services/index.js';
import { AdminAddUserToGroup, AdminAddUserToGroupTarget } from './adminAddUserToGroup.js';

const originalDate = new Date();

describe('AdminAddUserToGroup target', () => {
  let adminAddUserToGroup: AdminAddUserToGroupTarget;
  let mockUserPoolService: jest.Mocked<UserPoolService>;
  let clock: ClockFake;

  beforeEach(() => {
    mockUserPoolService = newMockUserPoolService();
    clock = new ClockFake(originalDate);

    adminAddUserToGroup = AdminAddUserToGroup({
      cognito: newMockCognitoService(mockUserPoolService),
    });
  });

  it('adds the user to a group', async () => {
    const existingGroup = TDB.group();
    const existingUser = TDB.user();

    mockUserPoolService.getGroupByGroupName.mockResolvedValue(existingGroup);
    mockUserPoolService.getUserByUsername.mockResolvedValue(existingUser);

    const newDate = new Date();
    clock.advanceTo(newDate);

    await adminAddUserToGroup(TestContext, {
      GroupName: existingGroup.GroupName,
      Username: existingUser.Username,
      UserPoolId: 'test',
    });

    expect(mockUserPoolService.addUserToGroup).toHaveBeenCalledWith(
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
      adminAddUserToGroup(TestContext, {
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
      adminAddUserToGroup(TestContext, {
        GroupName: existingGroup.GroupName,
        Username: 'user',
        UserPoolId: 'test',
      })
    ).rejects.toEqual(new UserNotFoundError());
  });
});
