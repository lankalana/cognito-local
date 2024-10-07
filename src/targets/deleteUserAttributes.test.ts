import jwt from "jsonwebtoken";
import * as uuid from "uuid";
import { ClockFake } from "../__tests__/clockFake.js";
import { newMockCognitoService } from "../__tests__/mockCognitoService.js";
import { newMockUserPoolService } from "../__tests__/mockUserPoolService.js";
import { TestContext } from "../__tests__/testContext.js";
import { InvalidParameterError, NotAuthorizedError } from "../errors.js";
import PrivateKey from "../keys/cognitoLocal.private.json" with { type: "json" };
import { UserPoolService } from "../services/index.js";
import { attribute } from "../services/userPoolService.js";
import {
  DeleteUserAttributes,
  DeleteUserAttributesTarget,
} from "./deleteUserAttributes.js";
import * as TDB from "../__tests__/testDataBuilder.js";

const clock = new ClockFake(new Date());

const validToken = jwt.sign(
  {
    sub: "0000-0000",
    event_id: "0",
    token_use: "access",
    scope: "aws.cognito.signin.user.admin",
    auth_time: new Date(),
    jti: uuid.v4(),
    client_id: "test",
    username: "0000-0000",
  },
  PrivateKey.pem,
  {
    algorithm: "RS256",
    issuer: `http://localhost:9229/test`,
    expiresIn: "24h",
    keyid: "CognitoLocal",
  },
);

describe("DeleteUserAttributes target", () => {
  let deleteUserAttributes: DeleteUserAttributesTarget;
  let mockUserPoolService: jest.Mocked<UserPoolService>;

  beforeEach(() => {
    mockUserPoolService = newMockUserPoolService();
    deleteUserAttributes = DeleteUserAttributes({
      clock,
      cognito: newMockCognitoService(mockUserPoolService),
    });
  });

  it("throws if the user doesn't exist", async () => {
    mockUserPoolService.getUserByUsername.mockResolvedValue(null);

    await expect(
      deleteUserAttributes(TestContext, {
        AccessToken: validToken,
        UserAttributeNames: ["custom:example"],
      }),
    ).rejects.toEqual(new NotAuthorizedError());
  });

  it("throws if the token is invalid", async () => {
    await expect(
      deleteUserAttributes(TestContext, {
        AccessToken: "invalid token",
        UserAttributeNames: ["custom:example"],
      }),
    ).rejects.toEqual(new InvalidParameterError());
  });

  it("saves the updated attributes on the user", async () => {
    const user = TDB.user({
      Attributes: [
        attribute("email", "example@example.com"),
        attribute("custom:example", "1"),
      ],
    });

    mockUserPoolService.getUserByUsername.mockResolvedValue(user);

    await deleteUserAttributes(TestContext, {
      AccessToken: validToken,
      UserAttributeNames: ["custom:example"],
    });

    expect(mockUserPoolService.saveUser).toHaveBeenCalledWith(TestContext, {
      ...user,
      Attributes: [attribute("email", "example@example.com")],
      UserLastModifiedDate: clock.get(),
    });
  });
});
