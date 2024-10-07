import { newMockCognitoService } from "../__tests__/mockCognitoService.js";
import { newMockUserPoolService } from "../__tests__/mockUserPoolService.js";
import { TestContext } from "../__tests__/testContext.js";
import * as TDB from "../__tests__/testDataBuilder.js";
import { CognitoService } from "../services/index.js";
import { ListUserPools, ListUserPoolsTarget } from "./listUserPools.js";

describe("ListUserPools target", () => {
  let listUserPools: ListUserPoolsTarget;
  let mockCognitoService: jest.Mocked<CognitoService>;

  beforeEach(() => {
    mockCognitoService = newMockCognitoService(newMockUserPoolService());
    listUserPools = ListUserPools({
      cognito: mockCognitoService,
    });
  });

  it("lists user pools", async () => {
    const userPool1 = TDB.userPool();
    const userPool2 = TDB.userPool();

    mockCognitoService.listUserPools.mockResolvedValue([userPool1, userPool2]);

    const output = await listUserPools(TestContext, {
      MaxResults: 10,
    });

    expect(output).toBeDefined();
    expect(output.UserPools).toEqual([userPool1, userPool2]);
  });
});
