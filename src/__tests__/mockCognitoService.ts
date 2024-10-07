import { CognitoServiceFactory } from '../services/cognitoService.js';
import { CognitoService, UserPoolService } from '../services/index.js';
import { newMockUserPoolService } from './mockUserPoolService.js';

export const newMockCognitoService = (
  userPoolClient: UserPoolService = newMockUserPoolService()
): jest.Mocked<CognitoService> => ({
  createUserPool: jest.fn(),
  deleteUserPool: jest.fn(),
  getAppClient: jest.fn(),
  getUserPool: jest.fn().mockResolvedValue(userPoolClient),
  getUserPoolForClientId: jest.fn().mockResolvedValue(userPoolClient),
  listAppClients: jest.fn(),
  listUserPools: jest.fn(),
});

export const newMockCognitoServiceFactory = (
  cognitoService: jest.Mocked<CognitoService> = newMockCognitoService()
): jest.Mocked<CognitoServiceFactory> => ({
  create: jest.fn().mockResolvedValue(cognitoService),
});
