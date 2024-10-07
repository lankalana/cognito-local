import { UserPoolService } from '../services/index.js';
import { UserPool, UserPoolServiceFactory } from '../services/userPoolService.js';

export const newMockUserPoolService = (
  config: UserPool = {
    Id: 'test',
  }
): jest.Mocked<UserPoolService> => ({
  addUserToGroup: jest.fn(),
  deleteAppClient: jest.fn(),
  deleteGroup: jest.fn(),
  deleteIdentityProvider: jest.fn(),
  deleteUser: jest.fn(),
  getGroupByGroupName: jest.fn(),
  getIdentityProviderByIdentifier: jest.fn(),
  getIdentityProviderByProviderName: jest.fn(),
  getUserByRefreshToken: jest.fn(),
  getUserByUsername: jest.fn(),
  listGroups: jest.fn(),
  listIdentityProviders: jest.fn(),
  listUserGroupMembership: jest.fn(),
  listUsers: jest.fn(),
  options: config,
  removeUserFromGroup: jest.fn(),
  saveAppClient: jest.fn(),
  saveGroup: jest.fn(),
  saveIdentityProvider: jest.fn(),
  saveUser: jest.fn(),
  storeRefreshToken: jest.fn(),
  updateOptions: jest.fn(),
});

export const newMockUserPoolServiceFactory = (
  cognitoService: jest.Mocked<UserPoolService> = newMockUserPoolService()
): jest.Mocked<UserPoolServiceFactory> => ({
  create: jest.fn().mockResolvedValue(cognitoService),
});
