import { newMockCognitoService } from "../__tests__/mockCognitoService";
import { newMockUserPoolService } from "../__tests__/mockUserPoolService";
import { TestContext } from "../__tests__/testContext";
import * as TDB from "../__tests__/testDataBuilder";
import { IdentityProviderNotFoundError } from "../errors";
import { UserPoolService } from "../services";
import {
  DescribeIdentityProvider,
  DescribeIdentityProviderTarget,
} from "./describeIdentityProvider";

describe("DescribeIdentityProvider target", () => {
  let describeIdentityProvider: DescribeIdentityProviderTarget;
  let mockUserPoolService: jest.Mocked<UserPoolService>;

  beforeEach(() => {
    mockUserPoolService = newMockUserPoolService();

    describeIdentityProvider = DescribeIdentityProvider({
      cognito: newMockCognitoService(mockUserPoolService),
    });
  });

  it("gets a group", async () => {
    const existingGroup = TDB.identityProvider();

    mockUserPoolService.getIdentityProviderByProviderName.mockResolvedValue(
      existingGroup,
    );

    const result = await describeIdentityProvider(TestContext, {
      ProviderName: existingGroup.ProviderName,
      UserPoolId: "test",
    });

    expect(
      mockUserPoolService.getIdentityProviderByProviderName,
    ).toHaveBeenCalledWith(TestContext, existingGroup.ProviderName);

    expect(result.IdentityProvider).toEqual({
      ProviderName: existingGroup.ProviderName,
      ProviderType: existingGroup.ProviderType,
      ProviderDetails: existingGroup.ProviderDetails,
      AttributeMapping: existingGroup.AttributeMapping,
      IdpIdentifiers: existingGroup.IdpIdentifiers,
      LastModifiedDate: existingGroup.LastModifiedDate,
      CreationDate: existingGroup.CreationDate,
      UserPoolId: "test",
    });
  });

  it("throws if the identity provider doesn't exist", async () => {
    mockUserPoolService.getIdentityProviderByProviderName.mockResolvedValue(
      null,
    );

    await expect(
      describeIdentityProvider(TestContext, {
        ProviderName: "identityProvider",
        UserPoolId: "test",
      }),
    ).rejects.toEqual(new IdentityProviderNotFoundError());
  });
});
