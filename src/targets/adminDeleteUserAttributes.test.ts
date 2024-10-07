import { ClockFake } from '../__tests__/clockFake.js';
import { newMockCognitoService } from '../__tests__/mockCognitoService.js';
import { newMockUserPoolService } from '../__tests__/mockUserPoolService.js';
import { TestContext } from '../__tests__/testContext.js';
import * as TDB from '../__tests__/testDataBuilder.js';
import { NotAuthorizedError } from '../errors.js';
import { UserPoolService } from '../services/index.js';
import { attribute } from '../services/userPoolService.js';
import {
  AdminDeleteUserAttributes,
  AdminDeleteUserAttributesTarget,
} from './adminDeleteUserAttributes.js';

describe('AdminDeleteUserAttributes target', () => {
  let adminDeleteUserAttributes: AdminDeleteUserAttributesTarget;
  let mockUserPoolService: jest.Mocked<UserPoolService>;
  let clock: ClockFake;

  beforeEach(() => {
    mockUserPoolService = newMockUserPoolService();
    clock = new ClockFake(new Date());
    adminDeleteUserAttributes = AdminDeleteUserAttributes({
      clock,
      cognito: newMockCognitoService(mockUserPoolService),
    });
  });

  it("throws if the user doesn't exist", async () => {
    await expect(
      adminDeleteUserAttributes(TestContext, {
        UserPoolId: 'test',
        Username: 'abc',
        UserAttributeNames: ['custom:example'],
      })
    ).rejects.toEqual(new NotAuthorizedError());
  });

  it('saves the updated attributes on the user', async () => {
    const user = TDB.user({
      Attributes: [attribute('email', 'example@example.com'), attribute('custom:example', '1')],
    });

    mockUserPoolService.getUserByUsername.mockResolvedValue(user);

    await adminDeleteUserAttributes(TestContext, {
      UserPoolId: 'test',
      Username: 'abc',
      UserAttributeNames: ['custom:example'],
    });

    expect(mockUserPoolService.saveUser).toHaveBeenCalledWith(TestContext, {
      ...user,
      Attributes: [attribute('email', 'example@example.com')],
      UserLastModifiedDate: clock.get(),
    });
  });
});
