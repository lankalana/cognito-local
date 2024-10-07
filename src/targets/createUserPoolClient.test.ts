import { ClockFake } from '../__tests__/clockFake.js';
import { newMockCognitoService } from '../__tests__/mockCognitoService.js';
import { newMockUserPoolService } from '../__tests__/mockUserPoolService.js';
import { TestContext } from '../__tests__/testContext.js';
import { UserPoolService } from '../services/index.js';
import { CreateUserPoolClient, CreateUserPoolClientTarget } from './createUserPoolClient.js';

const originalDate = new Date();

describe('CreateUserPoolClient target', () => {
  let createUserPoolClient: CreateUserPoolClientTarget;
  let mockUserPoolService: jest.Mocked<UserPoolService>;

  beforeEach(() => {
    mockUserPoolService = newMockUserPoolService();
    createUserPoolClient = CreateUserPoolClient({
      clock: new ClockFake(originalDate),
      cognito: newMockCognitoService(mockUserPoolService),
    });
  });

  it('creates a new app client', async () => {
    const result = await createUserPoolClient(TestContext, {
      ClientName: 'clientName',
      UserPoolId: 'userPoolId',
    });

    expect(mockUserPoolService.saveAppClient).toHaveBeenCalledWith(TestContext, {
      ClientId: expect.any(String),
      ClientName: 'clientName',
      CreationDate: originalDate,
      LastModifiedDate: originalDate,
      UserPoolId: 'userPoolId',
      TokenValidityUnits: {
        AccessToken: 'hours',
        IdToken: 'minutes',
        RefreshToken: 'days',
      },
    });

    expect(result).toEqual({
      UserPoolClient: {
        ClientId: expect.any(String),
        ClientName: 'clientName',
        CreationDate: originalDate,
        LastModifiedDate: originalDate,
        UserPoolId: 'userPoolId',
        TokenValidityUnits: {
          AccessToken: 'hours',
          IdToken: 'minutes',
          RefreshToken: 'days',
        },
      },
    });
  });
});
