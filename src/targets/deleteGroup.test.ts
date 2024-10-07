import { newMockCognitoService } from '../__tests__/mockCognitoService.js';
import { newMockUserPoolService } from '../__tests__/mockUserPoolService.js';
import { TestContext } from '../__tests__/testContext.js';
import * as TDB from '../__tests__/testDataBuilder.js';
import { GroupNotFoundError } from '../errors.js';
import { UserPoolService } from '../services/index.js';
import { DeleteGroup, DeleteGroupTarget } from './deleteGroup.js';

describe('DeleteGroup target', () => {
  let deleteGroup: DeleteGroupTarget;
  let mockUserPoolService: jest.Mocked<UserPoolService>;

  beforeEach(() => {
    mockUserPoolService = newMockUserPoolService();

    deleteGroup = DeleteGroup({
      cognito: newMockCognitoService(mockUserPoolService),
    });
  });

  it('deletes a group', async () => {
    const existingGroup = TDB.group();

    mockUserPoolService.getGroupByGroupName.mockResolvedValue(existingGroup);

    await deleteGroup(TestContext, {
      GroupName: existingGroup.GroupName,
      UserPoolId: 'test',
    });

    expect(mockUserPoolService.deleteGroup).toHaveBeenCalledWith(TestContext, existingGroup);
  });

  it("throws if the group doesn't exist", async () => {
    mockUserPoolService.getGroupByGroupName.mockResolvedValue(null);

    await expect(
      deleteGroup(TestContext, {
        GroupName: 'group',
        UserPoolId: 'test',
      })
    ).rejects.toEqual(new GroupNotFoundError());
  });
});
