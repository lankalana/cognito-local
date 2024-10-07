import { newMockCognitoService } from "../__tests__/mockCognitoService.js";
import { newMockUserPoolService } from "../__tests__/mockUserPoolService.js";
import { TestContext } from "../__tests__/testContext.js";
import * as TDB from "../__tests__/testDataBuilder.js";
import { CognitoService } from "../services/index.js";
import { DeleteUserPool, DeleteUserPoolTarget } from "./deleteUserPool.js";

describe("DeleteUserPool target", () => {
  let deleteUserPool: DeleteUserPoolTarget;
  let mockCognitoService: jest.Mocked<CognitoService>;

  beforeEach(() => {
    mockCognitoService = newMockCognitoService(newMockUserPoolService());

    deleteUserPool = DeleteUserPool({
      cognito: mockCognitoService,
    });
  });

  it("deletes a user pool client", async () => {
    const userPool = TDB.userPool();

    mockCognitoService.getUserPool.mockResolvedValue(
      newMockUserPoolService(userPool),
    );

    await deleteUserPool(TestContext, {
      UserPoolId: "test",
    });

    expect(mockCognitoService.deleteUserPool).toHaveBeenCalledWith(
      TestContext,
      userPool,
    );
  });

  it.todo("throws if the user pool doesn't exist");
});
