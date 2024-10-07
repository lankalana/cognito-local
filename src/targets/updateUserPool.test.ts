import { newMockCognitoService } from "../__tests__/mockCognitoService.js";
import { newMockUserPoolService } from "../__tests__/mockUserPoolService.js";
import { TestContext } from "../__tests__/testContext.js";
import * as TDB from "../__tests__/testDataBuilder.js";
import { CognitoService, UserPoolService } from "../services/index.js";
import { UpdateUserPool, UpdateUserPoolTarget } from "./updateUserPool.js";

describe("UpdateUserPool target", () => {
  let updateUserPool: UpdateUserPoolTarget;
  let mockCognitoService: jest.Mocked<CognitoService>;
  let mockUserPoolService: jest.Mocked<UserPoolService>;

  beforeEach(() => {
    mockUserPoolService = newMockUserPoolService();
    mockCognitoService = newMockCognitoService(mockUserPoolService);

    updateUserPool = UpdateUserPool({
      cognito: mockCognitoService,
    });
  });

  it("updates a user pool", async () => {
    const existingUserPool = TDB.userPool({
      Name: "name",
    });

    const userPoolService = newMockUserPoolService(existingUserPool);

    mockCognitoService.getUserPool.mockResolvedValue(userPoolService);

    await updateUserPool(TestContext, {
      UserPoolId: existingUserPool.Id,
      MfaConfiguration: "OPTIONAL",
    });

    expect(userPoolService.updateOptions).toHaveBeenCalledWith(TestContext, {
      ...existingUserPool,
      MfaConfiguration: "OPTIONAL",
    });
  });

  it.todo("throws if the user pool client doesn't exist");
});
