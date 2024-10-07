import jwt from 'jsonwebtoken';
import * as uuid from 'uuid';

import { ClockFake } from '../__tests__/clockFake.js';
import { newMockCognitoService } from '../__tests__/mockCognitoService.js';
import { newMockUserPoolService } from '../__tests__/mockUserPoolService.js';
import { TestContext } from '../__tests__/testContext.js';
import * as TDB from '../__tests__/testDataBuilder.js';
import { InvalidParameterError, InvalidPasswordError, NotAuthorizedError } from '../errors.js';
import PrivateKey from '../keys/cognitoLocal.private.json' with { type: 'json' };
import { UserPoolService } from '../services/index.js';
import { ChangePassword, ChangePasswordTarget } from './changePassword.js';

const currentDate = new Date();

describe('ChangePassword target', () => {
  let changePassword: ChangePasswordTarget;
  let mockUserPoolService: jest.Mocked<UserPoolService>;

  beforeEach(() => {
    mockUserPoolService = newMockUserPoolService();
    changePassword = ChangePassword({
      cognito: newMockCognitoService(mockUserPoolService),
      clock: new ClockFake(currentDate),
    });
  });

  it("throws if token isn't valid", async () => {
    await expect(
      changePassword(TestContext, {
        AccessToken: 'blah',
        PreviousPassword: 'abc',
        ProposedPassword: 'def',
      })
    ).rejects.toBeInstanceOf(InvalidParameterError);

    expect(mockUserPoolService.saveUser).not.toHaveBeenCalled();
  });

  it("throws if user doesn't exist", async () => {
    mockUserPoolService.getUserByUsername.mockResolvedValue(null);

    await expect(
      changePassword(TestContext, {
        AccessToken: jwt.sign(
          {
            sub: '0000-0000',
            event_id: '0',
            token_use: 'access',
            scope: 'aws.cognito.signin.user.admin',
            auth_time: new Date(),
            jti: uuid.v4(),
            client_id: 'test',
            username: '0000-0000',
          },
          PrivateKey.pem,
          {
            algorithm: 'RS256',
            issuer: `http://localhost:9229/test`,
            expiresIn: '24h',
            keyid: 'CognitoLocal',
          }
        ),
        PreviousPassword: 'abc',
        ProposedPassword: 'def',
      })
    ).rejects.toEqual(new NotAuthorizedError());

    expect(mockUserPoolService.saveUser).not.toHaveBeenCalled();
  });

  it("throws if previous password doesn't match", async () => {
    const user = TDB.user({
      Password: 'previous-password',
    });

    mockUserPoolService.getUserByUsername.mockResolvedValue(user);

    await expect(
      changePassword(TestContext, {
        AccessToken: jwt.sign(
          {
            sub: '0000-0000',
            event_id: '0',
            token_use: 'access',
            scope: 'aws.cognito.signin.user.admin',
            auth_time: new Date(),
            jti: uuid.v4(),
            client_id: 'test',
            username: '0000-0000',
          },
          PrivateKey.pem,
          {
            algorithm: 'RS256',
            issuer: `http://localhost:9229/test`,
            expiresIn: '24h',
            keyid: 'CognitoLocal',
          }
        ),
        PreviousPassword: 'abc',
        ProposedPassword: 'def',
      })
    ).rejects.toEqual(new InvalidPasswordError());

    expect(mockUserPoolService.saveUser).not.toHaveBeenCalled();
  });

  it("updates the user's password if the previous password matches", async () => {
    const user = TDB.user({
      Password: 'previous-password',
    });

    mockUserPoolService.getUserByUsername.mockResolvedValue(user);

    await changePassword(TestContext, {
      AccessToken: jwt.sign(
        {
          sub: '0000-0000',
          event_id: '0',
          token_use: 'access',
          scope: 'aws.cognito.signin.user.admin',
          auth_time: new Date(),
          jti: uuid.v4(),
          client_id: 'test',
          username: '0000-0000',
        },
        PrivateKey.pem,
        {
          algorithm: 'RS256',
          issuer: `http://localhost:9229/test`,
          expiresIn: '24h',
          keyid: 'CognitoLocal',
        }
      ),
      PreviousPassword: 'previous-password',
      ProposedPassword: 'new-password',
    });

    expect(mockUserPoolService.saveUser).toHaveBeenCalledWith(TestContext, {
      ...user,
      Password: 'new-password',
      UserLastModifiedDate: currentDate,
    });
  });
});
