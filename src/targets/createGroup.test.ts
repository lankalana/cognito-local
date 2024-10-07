import { ClockFake } from "../__tests__/clockFake.js";
import { newMockCognitoService } from "../__tests__/mockCognitoService.js";
import { newMockUserPoolService } from "../__tests__/mockUserPoolService.js";
import { TestContext } from "../__tests__/testContext.js";
import { UserPoolService } from "../services/index.js";
import { CreateGroup, CreateGroupTarget } from "./createGroup.js";

const originalDate = new Date();

describe("CreateGroup target", () => {
  let createGroup: CreateGroupTarget;
  let mockUserPoolService: jest.Mocked<UserPoolService>;

  beforeEach(() => {
    mockUserPoolService = newMockUserPoolService();
    createGroup = CreateGroup({
      clock: new ClockFake(originalDate),
      cognito: newMockCognitoService(mockUserPoolService),
    });
  });

  it("creates a group", async () => {
    await createGroup(TestContext, {
      Description: "Description",
      GroupName: "theGroupName",
      Precedence: 1,
      RoleArn: "ARN",
      UserPoolId: "test",
    });

    expect(mockUserPoolService.saveGroup).toHaveBeenCalledWith(TestContext, {
      CreationDate: originalDate,
      Description: "Description",
      GroupName: "theGroupName",
      LastModifiedDate: originalDate,
      Precedence: 1,
      RoleArn: "ARN",
    });
  });
});
