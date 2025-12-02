import { beforeEach, describe, expect, it, type MockedObject } from "vitest";
import { newMockCognitoService } from "../__tests__/mockCognitoService.js";
import { newMockUserPoolService } from "../__tests__/mockUserPoolService.js";
import { TestContext } from "../__tests__/testContext.js";
import * as TDB from "../__tests__/testDataBuilder.js";
import { IdentityProviderNotFoundError } from "../errors.js";
import type { UserPoolService } from "../services/index.js";
import {
  DeleteIdentityProvider,
  type DeleteIdentityProviderTarget,
} from "./deleteIdentityProvider.js";

describe("DeleteIdentityProvider target", () => {
  let deleteIdentityProvider: DeleteIdentityProviderTarget;
  let mockUserPoolService: MockedObject<UserPoolService>;

  beforeEach(() => {
    mockUserPoolService = newMockUserPoolService();

    deleteIdentityProvider = DeleteIdentityProvider({
      cognito: newMockCognitoService(mockUserPoolService),
    });
  });

  it("deletes an identity provider", async () => {
    const existingIdentityProvider = TDB.identityProvider();

    mockUserPoolService.getIdentityProviderByProviderName.mockResolvedValue(
      existingIdentityProvider,
    );

    await deleteIdentityProvider(TestContext, {
      ProviderName: existingIdentityProvider.ProviderName,
      UserPoolId: "test",
    });

    expect(mockUserPoolService.deleteIdentityProvider).toHaveBeenCalledWith(
      TestContext,
      existingIdentityProvider,
    );
  });

  it("throws if the group doesn't exist", async () => {
    mockUserPoolService.getGroupByGroupName.mockResolvedValue(null);

    await expect(
      deleteIdentityProvider(TestContext, {
        ProviderName: "identityProvider",
        UserPoolId: "test",
      }),
    ).rejects.toEqual(new IdentityProviderNotFoundError());
  });
});
