import jwt from 'jsonwebtoken';
import * as uuid from 'uuid';

import { newMockCognitoService } from '../__tests__/mockCognitoService.js';
import { newMockUserPoolService } from '../__tests__/mockUserPoolService.js';
import { TestContext } from '../__tests__/testContext.js';
import * as TDB from '../__tests__/testDataBuilder.js';
import { InvalidParameterError, UserNotFoundError } from '../errors.js';
import PrivateKey from '../keys/cognitoLocal.private.json' with { type: 'json' };
import { UserPoolService } from '../services/index.js';
import { attributeValue } from '../services/userPoolService.js';
import { GetUser, GetUserTarget } from './getUser.js';

describe('GetUser target', () => {
  let getUser: GetUserTarget;
  let mockUserPoolService: jest.Mocked<UserPoolService>;

  beforeEach(() => {
    mockUserPoolService = newMockUserPoolService();
    getUser = GetUser({
      cognito: newMockCognitoService(mockUserPoolService),
    });
  });

  it('parses token get user by sub', async () => {
    const user = TDB.user();

    mockUserPoolService.getUserByUsername.mockResolvedValue(user);

    const output = await getUser(TestContext, {
      AccessToken: jwt.sign(
        {
          sub: attributeValue('sub', user.Attributes),
          event_id: '0',
          token_use: 'access',
          scope: 'aws.cognito.signin.user.admin',
          auth_time: new Date(),
          jti: uuid.v4(),
          client_id: 'test',
          username: user.Username,
        },
        PrivateKey.pem,
        {
          algorithm: 'RS256',
          issuer: `http://localhost:9229/test`,
          expiresIn: '24h',
          keyid: 'CognitoLocal',
        }
      ),
    });

    expect(output).toBeDefined();
    expect(output).toEqual({
      UserAttributes: user.Attributes,
      Username: user.Username,
    });
  });

  it("throws if token isn't valid", async () => {
    await expect(
      getUser(TestContext, {
        AccessToken: 'blah',
      })
    ).rejects.toBeInstanceOf(InvalidParameterError);
  });

  it("throws if user doesn't exist", async () => {
    mockUserPoolService.getUserByUsername.mockResolvedValue(null);

    await expect(
      getUser(TestContext, {
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
      })
    ).rejects.toEqual(new UserNotFoundError());
  });
});
