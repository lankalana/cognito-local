import { newMockCognitoService } from '../__tests__/mockCognitoService.js';
import { newMockUserPoolService } from '../__tests__/mockUserPoolService.js';
import { TestContext } from '../__tests__/testContext.js';
import * as TDB from '../__tests__/testDataBuilder.js';
import { UserNotFoundError } from '../errors.js';
import { UserPoolService } from '../services/index.js';
import { AdminListGroupsForUser, AdminListGroupsForUserTarget } from './adminListGroupsForUser.js';

describe('AdminListGroupsForUser target', () => {
  let adminListGroupsForUser: AdminListGroupsForUserTarget;
  let mockUserPoolService: jest.Mocked<UserPoolService>;

  beforeEach(() => {
    mockUserPoolService = newMockUserPoolService();

    adminListGroupsForUser = AdminListGroupsForUser({
      cognito: newMockCognitoService(mockUserPoolService),
    });
  });

  it("returns no groups when the user isn't in the group", async () => {
    const existingUser = TDB.user();
    const existingGroup1 = TDB.group();
    const existingGroup2 = TDB.group();

    mockUserPoolService.getUserByUsername.mockResolvedValue(existingUser);
    mockUserPoolService.listGroups.mockResolvedValue([existingGroup1, existingGroup2]);

    const result = await adminListGroupsForUser(TestContext, {
      Username: existingUser.Username,
      UserPoolId: 'test',
    });

    expect(mockUserPoolService.listGroups).toHaveBeenCalledWith(TestContext);

    expect(result.Groups).toEqual([]);
  });

  it('returns the groups that the user is assigned to', async () => {
    const existingUser = TDB.user();
    const existingGroup1 = TDB.group();
    const existingGroup2 = TDB.group({
      members: [existingUser.Username],
    });

    mockUserPoolService.getUserByUsername.mockResolvedValue(existingUser);
    mockUserPoolService.listGroups.mockResolvedValue([existingGroup1, existingGroup2]);

    const result = await adminListGroupsForUser(TestContext, {
      Username: existingUser.Username,
      UserPoolId: 'test',
    });

    expect(mockUserPoolService.listGroups).toHaveBeenCalledWith(TestContext);

    expect(result.Groups).toEqual([
      {
        CreationDate: existingGroup2.CreationDate,
        Description: existingGroup2.Description,
        GroupName: existingGroup2.GroupName,
        LastModifiedDate: existingGroup2.LastModifiedDate,
        Precedence: existingGroup2.Precedence,
        RoleArn: existingGroup2.RoleArn,
        UserPoolId: 'test',
      },
    ]);
  });

  it("throws if the user doesn't exist", async () => {
    mockUserPoolService.getUserByUsername.mockResolvedValue(null);

    await expect(
      adminListGroupsForUser(TestContext, {
        Username: 'user',
        UserPoolId: 'test',
      })
    ).rejects.toEqual(new UserNotFoundError());
  });
});
