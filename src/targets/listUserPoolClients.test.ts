import { newMockCognitoService } from '../__tests__/mockCognitoService.js';
import { newMockUserPoolService } from '../__tests__/mockUserPoolService.js';
import { TestContext } from '../__tests__/testContext.js';
import * as TDB from '../__tests__/testDataBuilder.js';
import { CognitoService } from '../services/index.js';
import { ListUserPoolClients, ListUserPoolClientsTarget } from './listUserPoolClients.js';
import { appClientToResponseListObject } from './responses.js';

describe('ListUserPoolClients target', () => {
  let mockCognitoService: jest.Mocked<CognitoService>;
  let listUserPoolClients: ListUserPoolClientsTarget;

  beforeEach(() => {
    mockCognitoService = newMockCognitoService(newMockUserPoolService());
    listUserPoolClients = ListUserPoolClients({
      cognito: mockCognitoService,
    });
  });

  it('lists user pool clients', async () => {
    const appClient1 = TDB.appClient();
    const appClient2 = TDB.appClient();

    mockCognitoService.listAppClients.mockResolvedValue([appClient1, appClient2]);

    const output = await listUserPoolClients(TestContext, {
      UserPoolId: 'userPoolId',
    });

    expect(output).toBeDefined();
    expect(output.UserPoolClients).toEqual([
      appClientToResponseListObject(appClient1),
      appClientToResponseListObject(appClient2),
    ]);
  });
});
