import { newMockCognitoService } from '../__tests__/mockCognitoService.js';
import { newMockUserPoolService } from '../__tests__/mockUserPoolService.js';
import { TestContext } from '../__tests__/testContext.js';
import * as TDB from '../__tests__/testDataBuilder.js';
import { CognitoService } from '../services/index.js';
import { DescribeUserPool, DescribeUserPoolTarget } from './describeUserPool.js';

describe('DescribeUserPool target', () => {
  let describeUserPool: DescribeUserPoolTarget;
  let mockCognitoService: jest.Mocked<CognitoService>;

  beforeEach(() => {
    mockCognitoService = newMockCognitoService(newMockUserPoolService());
    describeUserPool = DescribeUserPool({
      cognito: mockCognitoService,
    });
  });

  it('returns an existing user pool', async () => {
    const existingUserPool = TDB.userPool();
    mockCognitoService.getUserPool.mockResolvedValue(newMockUserPoolService(existingUserPool));

    const result = await describeUserPool(TestContext, {
      UserPoolId: existingUserPool.Id,
    });

    expect(result).toEqual({
      UserPool: existingUserPool,
    });
  });

  it.todo('throws resource not found for an invalid user pool');
});
