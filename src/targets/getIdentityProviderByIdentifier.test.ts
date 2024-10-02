import { newMockCognitoService } from "../__tests__/mockCognitoService";
import { newMockUserPoolService } from "../__tests__/mockUserPoolService";
import { TestContext } from "../__tests__/testContext";
import * as TDB from "../__tests__/testDataBuilder";
import { IdentityProviderNotFoundError } from "../errors";
import { UserPoolService } from "../services";
import {
  GetIdentityProviderByIdentifier,
  GetIdentityProviderByIdentifierTarget,
} from "./getIdentityProviderByIdentifier";

describe("GetIdentityProviderByIdentifier target", () => {
  let getIdentityProviderByIdentifier: GetIdentityProviderByIdentifierTarget;
  let mockUserPoolService: jest.Mocked<UserPoolService>;

  beforeEach(() => {
    mockUserPoolService = newMockUserPoolService();

    getIdentityProviderByIdentifier = GetIdentityProviderByIdentifier({
      cognito: newMockCognitoService(mockUserPoolService),
    });
  });

  it("gets an identity provider", async () => {
    const IdpIdentifier = "identifier";
    const existingIdentityProvider = TDB.identityProvider({
      IdpIdentifiers: [IdpIdentifier],
    });

    mockUserPoolService.getIdentityProviderByIdentifier.mockResolvedValue(
      existingIdentityProvider
    );

    const result = await getIdentityProviderByIdentifier(TestContext, {
      IdpIdentifier: IdpIdentifier,
      UserPoolId: "test",
    });

    expect(
      mockUserPoolService.getIdentityProviderByIdentifier
    ).toHaveBeenCalledWith(TestContext, IdpIdentifier);

    expect(result.IdentityProvider).toEqual({
      ProviderName: existingIdentityProvider.ProviderName,
      ProviderType: existingIdentityProvider.ProviderType,
      ProviderDetails: existingIdentityProvider.ProviderDetails,
      AttributeMapping: existingIdentityProvider.AttributeMapping,
      IdpIdentifiers: existingIdentityProvider.IdpIdentifiers,
      LastModifiedDate: existingIdentityProvider.LastModifiedDate,
      CreationDate: existingIdentityProvider.CreationDate,
      UserPoolId: "test",
    });
  });

  it("throws if the identity provider doesn't exist", async () => {
    mockUserPoolService.getIdentityProviderByIdentifier.mockResolvedValue(null);

    await expect(
      getIdentityProviderByIdentifier(TestContext, {
        IdpIdentifier: "identifier",
        UserPoolId: "test",
      })
    ).rejects.toEqual(new IdentityProviderNotFoundError());
  });
});
