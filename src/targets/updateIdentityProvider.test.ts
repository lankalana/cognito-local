import { beforeEach, describe, expect, it, type MockedObject, vi } from "vitest";
import { ClockFake } from "../__tests__/clockFake.js";
import { newMockCognitoService } from "../__tests__/mockCognitoService.js";
import { newMockUserPoolService } from "../__tests__/mockUserPoolService.js";
import { TestContext } from "../__tests__/testContext.js";
import * as TDB from "../__tests__/testDataBuilder.js";
import { IdentityProviderNotFoundError } from "../errors.js";
import type { UserPoolService } from "../services/index.js";
import {
  UpdateIdentityProvider,
  type UpdateIdentityProviderTarget,
} from "./updateIdentityProvider.js";

const originalDate = new Date();

describe("UpdateGroup target", () => {
  let updateIdentityProvider: UpdateIdentityProviderTarget;
  let mockUserPoolService: MockedObject<UserPoolService>;
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

    mockUserPoolService.getIdentityProviderByProviderName.mockReturnValue(
      Promise.resolve(existingIdentityProvider),
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

    expect(mockUserPoolService.getIdentityProviderByProviderName).toHaveBeenCalledWith(
      TestContext,
      existingIdentityProvider.ProviderName,
    );

    expect(mockUserPoolService.saveIdentityProvider).toHaveBeenCalledWith(TestContext, {
      ...existingIdentityProvider,
      LastModifiedDate: newDate,
      AttributeMapping: { newAttributeKey: "new attribute value" },
      IdpIdentifiers: ["newIdentifier"],
      ProviderDetails: { newProviderDetailKey: "new provider detail" },
    });

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

    mockUserPoolService.getIdentityProviderByProviderName = vi
      .fn()
      .mockReturnValue(existingIdentityProvider);

    const newDate = new Date();
    clock.advanceTo(new Date());

    const result = await updateIdentityProvider(TestContext, {
      ProviderName: existingIdentityProvider.ProviderName,
      UserPoolId: "test",
      IdpIdentifiers: ["newIdentifier"],
    });

    expect(mockUserPoolService.getIdentityProviderByProviderName).toHaveBeenCalledWith(
      TestContext,
      existingIdentityProvider.ProviderName,
    );

    expect(mockUserPoolService.saveIdentityProvider).toHaveBeenCalledWith(TestContext, {
      ...existingIdentityProvider,
      LastModifiedDate: newDate,
      IdpIdentifiers: ["newIdentifier"],
    });

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
    mockUserPoolService.getIdentityProviderByProviderName.mockReturnValue(Promise.resolve(null));

    await expect(
      updateIdentityProvider(TestContext, {
        ProviderName: "identityProvider",
        UserPoolId: "test",
      }),
    ).rejects.toEqual(new IdentityProviderNotFoundError());
  });
});
