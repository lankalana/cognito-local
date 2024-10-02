import { ClockFake } from "../__tests__/clockFake";
import { newMockCognitoService } from "../__tests__/mockCognitoService";
import { newMockUserPoolService } from "../__tests__/mockUserPoolService";
import { TestContext } from "../__tests__/testContext";
import { UserPoolService } from "../services";
import {
  CreateIdentityProvider,
  CreateIdentityProviderTarget,
} from "./createIdentityProvider";

const originalDate = new Date();

describe("CreateIdentityProvider target", () => {
  let createIdentityProvider: CreateIdentityProviderTarget;
  let mockUserPoolService: jest.Mocked<UserPoolService>;

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
      ProviderType: "theProviderType",
      ProviderDetails: {
        detailKey: "detailValue",
      },
      AttributeMapping: {
        attributeKey: "attributeValue",
      },
      IdpIdentifiers: ["identifier"],
    });

    expect(mockUserPoolService.saveIdentityProvider).toHaveBeenCalledWith(
      TestContext,
      {
        UserPoolId: "test",
        ProviderName: "theProviderName",
        ProviderType: "theProviderType",
        ProviderDetails: {
          detailKey: "detailValue",
        },
        AttributeMapping: {
          attributeKey: "attributeValue",
        },
        IdpIdentifiers: ["identifier"],
        LastModifiedDate: originalDate,
        CreationDate: originalDate,
      }
    );
  });
});
