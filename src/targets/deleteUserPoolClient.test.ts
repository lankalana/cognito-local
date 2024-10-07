import { newMockCognitoService } from '../__tests__/mockCognitoService.js';
import { newMockUserPoolService } from '../__tests__/mockUserPoolService.js';
import { TestContext } from '../__tests__/testContext.js';
import * as TDB from '../__tests__/testDataBuilder.js';
import { ResourceNotFoundError } from '../errors.js';
import { CognitoService, UserPoolService } from '../services/index.js';
import { DeleteUserPoolClient, DeleteUserPoolClientTarget } from './deleteUserPoolClient.js';

describe('DeleteUserPoolClient target', () => {
  let deleteUserPoolClient: DeleteUserPoolClientTarget;
  let mockUserPoolService: jest.Mocked<UserPoolService>;
  let mockCognitoService: jest.Mocked<CognitoService>;

  beforeEach(() => {
    mockUserPoolService = newMockUserPoolService();
    mockCognitoService = newMockCognitoService(mockUserPoolService);

    deleteUserPoolClient = DeleteUserPoolClient({
      cognito: mockCognitoService,
    });
  });

  it('deletes a user pool client', async () => {
    const existingAppClient = TDB.appClient({
      UserPoolId: 'test',
    });

    mockCognitoService.getAppClient.mockResolvedValue(existingAppClient);

    await deleteUserPoolClient(TestContext, {
      ClientId: existingAppClient.ClientId,
      UserPoolId: 'test',
    });

    expect(mockUserPoolService.deleteAppClient).toHaveBeenCalledWith(
      TestContext,
      existingAppClient
    );
  });

  it("throws if the user pool client doesn't exist", async () => {
    mockCognitoService.getAppClient.mockResolvedValue(null);

    await expect(
      deleteUserPoolClient(TestContext, {
        ClientId: 'clientId',
        UserPoolId: 'test',
      })
    ).rejects.toEqual(new ResourceNotFoundError());
  });

  it("throws if the user pool client UserPoolId doesn't match the request", async () => {
    const existingAppClient = TDB.appClient({
      ClientId: 'clientId',
      UserPoolId: 'pool-one',
    });

    mockCognitoService.getAppClient.mockResolvedValue(existingAppClient);

    await expect(
      deleteUserPoolClient(TestContext, {
        ClientId: 'clientId',
        UserPoolId: 'pool-two',
      })
    ).rejects.toEqual(new ResourceNotFoundError());
  });
});
