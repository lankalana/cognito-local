import { IdentityProviderTypeType } from "@aws-sdk/client-cognito-identity-provider";

import { beforeEach, describe, expect, it, type MockedObject } from "vitest";
import { ClockFake } from "../__tests__/clockFake.js";
import { newMockCognitoService } from "../__tests__/mockCognitoService.js";
import { newMockUserPoolService } from "../__tests__/mockUserPoolService.js";
import { TestContext } from "../__tests__/testContext.js";
import type { UserPoolService } from "../services/index.js";
import {
  CreateIdentityProvider,
  type CreateIdentityProviderTarget,
} from "./createIdentityProvider.js";

const originalDate = new Date();

describe("CreateIdentityProvider target", () => {
  let createIdentityProvider: CreateIdentityProviderTarget;
  let mockUserPoolService: MockedObject<UserPoolService>;

  beforeEach(() => {
    mockUserPoolService = newMockUserPoolService();
    createIdentityProvider = CreateIdentityProvider({
      clock: new ClockFake(originalDate),
      cognito: newMockCognitoService(mockUserPoolService),
    });
  });

  it("creates an identity provider", async () => {
    await createIdentityProvider(TestContext, {
      UserPoolId: "test",
      ProviderName: "theProviderName",
      ProviderType: IdentityProviderTypeType.OIDC,
      ProviderDetails: {
        detailKey: "detailValue",
      },
      AttributeMapping: {
        attributeKey: "attributeValue",
      },
      IdpIdentifiers: ["identifier"],
    });

    expect(mockUserPoolService.saveIdentityProvider).toHaveBeenCalledWith(TestContext, {
      UserPoolId: "test",
      ProviderName: "theProviderName",
      ProviderType: IdentityProviderTypeType.OIDC,
      ProviderDetails: {
        detailKey: "detailValue",
      },
      AttributeMapping: {
        attributeKey: "attributeValue",
      },
      IdpIdentifiers: ["identifier"],
      LastModifiedDate: originalDate,
      CreationDate: originalDate,
    });
  });
});
