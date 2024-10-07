import { newMockCognitoService } from '../__tests__/mockCognitoService.js';
import { newMockUserPoolService } from '../__tests__/mockUserPoolService.js';
import { TestContext } from '../__tests__/testContext.js';
import { ResourceNotFoundError } from '../errors.js';
import { AppClient } from '../services/appClient.js';
import { CognitoService } from '../services/index.js';
import { DescribeUserPoolClient, DescribeUserPoolClientTarget } from './describeUserPoolClient.js';

describe('DescribeUserPoolClient target', () => {
  let describeUserPoolClient: DescribeUserPoolClientTarget;
  let mockCognitoService: jest.Mocked<CognitoService>;

  beforeEach(() => {
    mockCognitoService = newMockCognitoService(newMockUserPoolService());
    describeUserPoolClient = DescribeUserPoolClient({
      cognito: mockCognitoService,
    });
  });

  it('returns an existing app client', async () => {
    const existingAppClient: AppClient = {
      RefreshTokenValidity: 30,
      AllowedOAuthFlowsUserPoolClient: false,
      LastModifiedDate: new Date(),
      CreationDate: new Date(),
      UserPoolId: 'userPoolId',
      ClientId: 'abc',
      ClientName: 'clientName',
    };
    mockCognitoService.getAppClient.mockResolvedValue(existingAppClient);

    const result = await describeUserPoolClient(TestContext, {
      ClientId: 'abc',
      UserPoolId: 'userPoolId',
    });

    expect(result).toEqual({
      UserPoolClient: {
        ...existingAppClient,
        CreationDate: new Date(existingAppClient.CreationDate),
        LastModifiedDate: new Date(existingAppClient.LastModifiedDate),
      },
    });
  });

  it('throws resource not found for an invalid app client', async () => {
    mockCognitoService.getAppClient.mockResolvedValue(null);

    await expect(
      describeUserPoolClient(TestContext, {
        ClientId: 'abc',
        UserPoolId: 'userPoolId',
      })
    ).rejects.toEqual(new ResourceNotFoundError());
  });
});
