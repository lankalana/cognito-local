import { ClockFake } from "../__tests__/clockFake";
import { newMockCognitoService } from "../__tests__/mockCognitoService";
import { newMockUserPoolService } from "../__tests__/mockUserPoolService";
import { TestContext } from "../__tests__/testContext";
import * as TDB from "../__tests__/testDataBuilder";
import { IdentityProviderNotFoundError } from "../errors";
import { UserPoolService } from "../services";
import {
  UpdateIdentityProvider,
  UpdateIdentityProviderTarget,
} from "./updateIdentityProvider";

const originalDate = new Date();

describe("UpdateGroup target", () => {
  let updateIdentityProvider: UpdateIdentityProviderTarget;
  let mockUserPoolService: jest.Mocked<UserPoolService>;
  let clock: ClockFake;

  beforeEach(() => {
    mockUserPoolService = newMockUserPoolService();
    clock = new ClockFake(originalDate);

    updateIdentityProvider = UpdateIdentityProvider({
      clock,
      cognito: newMockCognitoService(mockUserPoolService),
    });
  });

  it("updates an identity provider", async () => {
    const existingIdentityProvider = TDB.identityProvider();

    mockUserPoolService.getIdentityProviderByProviderName.mockResolvedValue(
      existingIdentityProvider,
    );

    const newDate = new Date();
    clock.advanceTo(new Date());

    const result = await updateIdentityProvider(TestContext, {
      UserPoolId: "test",
      ProviderName: existingIdentityProvider.ProviderName,
      AttributeMapping: { newAttributeKey: "new attribute value" },
      IdpIdentifiers: ["newIdentifier"],
      ProviderDetails: { newProviderDetailKey: "new provider detail" },
    });

    expect(
      mockUserPoolService.getIdentityProviderByProviderName,
    ).toHaveBeenCalledWith(TestContext, existingIdentityProvider.ProviderName);

    expect(mockUserPoolService.saveIdentityProvider).toHaveBeenCalledWith(
      TestContext,
      {
        ...existingIdentityProvider,
        LastModifiedDate: newDate,
        AttributeMapping: { newAttributeKey: "new attribute value" },
        IdpIdentifiers: ["newIdentifier"],
        ProviderDetails: { newProviderDetailKey: "new provider detail" },
      },
    );

    expect(result.IdentityProvider).toEqual({
      UserPoolId: "test",
      ProviderName: existingIdentityProvider.ProviderName,
      ProviderType: existingIdentityProvider.ProviderType,
      ProviderDetails: { newProviderDetailKey: "new provider detail" },
      AttributeMapping: { newAttributeKey: "new attribute value" },
      IdpIdentifiers: ["newIdentifier"],
      LastModifiedDate: newDate,
      CreationDate: existingIdentityProvider.CreationDate,
    });
  });

  it("can do partial updates of identity provider attributes", async () => {
    const existingIdentityProvider = TDB.identityProvider({
      IdpIdentifiers: ["old identifier"],
    });

    mockUserPoolService.getIdentityProviderByProviderName.mockResolvedValue(
      existingIdentityProvider,
    );

    const newDate = new Date();
    clock.advanceTo(new Date());

    const result = await updateIdentityProvider(TestContext, {
      ProviderName: existingIdentityProvider.ProviderName,
      UserPoolId: "test",
      IdpIdentifiers: ["newIdentifier"],
    });

    expect(
      mockUserPoolService.getIdentityProviderByProviderName,
    ).toHaveBeenCalledWith(TestContext, existingIdentityProvider.ProviderName);

    expect(mockUserPoolService.saveIdentityProvider).toHaveBeenCalledWith(
      TestContext,
      {
        ...existingIdentityProvider,
        LastModifiedDate: newDate,
        IdpIdentifiers: ["newIdentifier"],
      },
    );

    expect(result.IdentityProvider).toEqual({
      UserPoolId: "test",
      ProviderName: existingIdentityProvider.ProviderName,
      ProviderType: existingIdentityProvider.ProviderType,
      ProviderDetails: existingIdentityProvider.ProviderDetails,
      AttributeMapping: existingIdentityProvider.AttributeMapping,
      IdpIdentifiers: ["newIdentifier"],
      LastModifiedDate: newDate,
      CreationDate: existingIdentityProvider.CreationDate,
    });
  });

  it("throws if the identity provider doesn't exist", async () => {
    mockUserPoolService.getIdentityProviderByProviderName.mockResolvedValue(
      null,
    );

    await expect(
      updateIdentityProvider(TestContext, {
        ProviderName: "identityProvider",
        UserPoolId: "test",
      }),
    ).rejects.toEqual(new IdentityProviderNotFoundError());
  });
});
