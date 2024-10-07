import { newMockCognitoService } from '../__tests__/mockCognitoService.js';
import { newMockUserPoolService } from '../__tests__/mockUserPoolService.js';
import { TestContext } from '../__tests__/testContext.js';
import * as TDB from '../__tests__/testDataBuilder.js';
import { CognitoService, UserPoolService } from '../services/index.js';
import { RevokeToken, RevokeTokenTarget } from './revokeToken.js';

describe('AdminInitiateAuth target', () => {
  let revokeToken: RevokeTokenTarget;

  let mockUserPoolService: jest.Mocked<UserPoolService>;
  let mockCognitoService: jest.Mocked<CognitoService>;

  beforeEach(() => {
    mockUserPoolService = newMockUserPoolService();
    mockCognitoService = newMockCognitoService(mockUserPoolService);

    revokeToken = RevokeToken({
      cognito: mockCognitoService,
    });
  });

  it('remove refresh tokens from user refresh tokens', async () => {
    const existingUser = TDB.user();
    existingUser.RefreshTokens.push('token');

    mockUserPoolService.listUsers.mockResolvedValue([existingUser]);

    await revokeToken(TestContext, {
      ClientId: 'clientId',
      Token: 'token',
    });

    expect(mockUserPoolService.saveUser).toBeCalledWith(
      TestContext,
      expect.objectContaining({
        RefreshTokens: [],
      })
    );
  });
});
