import { ClockFake } from '../__tests__/clockFake.js';
import { newMockCognitoService } from '../__tests__/mockCognitoService.js';
import { newMockMessages } from '../__tests__/mockMessages.js';
import { newMockUserPoolService } from '../__tests__/mockUserPoolService.js';
import { TestContext } from '../__tests__/testContext.js';
import * as TDB from '../__tests__/testDataBuilder.js';
import { UserNotFoundError } from '../errors.js';
import { Messages, UserPoolService } from '../services/index.js';
import { attributeValue } from '../services/userPoolService.js';
import { ForgotPassword, ForgotPasswordTarget } from './forgotPassword.js';

const currentDate = new Date();

describe('ForgotPassword target', () => {
  let forgotPassword: ForgotPasswordTarget;
  let mockUserPoolService: jest.Mocked<UserPoolService>;
  let mockMessages: jest.Mocked<Messages>;
  let mockOtp: jest.MockedFunction<() => string>;

  beforeEach(() => {
    mockUserPoolService = newMockUserPoolService();
    mockMessages = newMockMessages();
    mockOtp = jest.fn().mockReturnValue('123456');
    forgotPassword = ForgotPassword({
      cognito: newMockCognitoService(mockUserPoolService),
      clock: new ClockFake(currentDate),
      messages: mockMessages,
      otp: mockOtp,
    });
  });

  it("throws if user doesn't exist", async () => {
    mockUserPoolService.getUserByUsername.mockResolvedValue(null);

    await expect(
      forgotPassword(TestContext, {
        ClientId: 'clientId',
        Username: '0000-0000',
      })
    ).rejects.toBeInstanceOf(UserNotFoundError);
  });

  it("sends a confirmation code to the user's email address", async () => {
    const user = TDB.user();

    mockUserPoolService.getUserByUsername.mockResolvedValue(user);

    const result = await forgotPassword(TestContext, {
      ClientId: 'clientId',
      Username: user.Username,
      ClientMetadata: { client: 'metadata' },
    });

    expect(mockMessages.deliver).toHaveBeenCalledWith(
      TestContext,
      'ForgotPassword',
      'clientId',
      'test',
      user,
      '123456',
      { client: 'metadata' },
      {
        AttributeName: 'email',
        DeliveryMedium: 'EMAIL',
        Destination: attributeValue('email', user.Attributes),
      }
    );

    expect(result).toEqual({
      CodeDeliveryDetails: {
        AttributeName: 'email',
        DeliveryMedium: 'EMAIL',
        Destination: attributeValue('email', user.Attributes),
      },
    });
  });

  it('saves the confirmation code on the user for comparison when confirming', async () => {
    const user = TDB.user();

    mockUserPoolService.getUserByUsername.mockResolvedValue(user);

    await forgotPassword(TestContext, {
      ClientId: 'clientId',
      Username: user.Username,
    });

    expect(mockUserPoolService.saveUser).toHaveBeenCalledWith(TestContext, {
      ...user,
      UserLastModifiedDate: currentDate,
      ConfirmationCode: '123456',
    });
  });
});
