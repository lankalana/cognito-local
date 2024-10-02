import { newMockCognitoService } from "../__tests__/mockCognitoService";
import { newMockUserPoolService } from "../__tests__/mockUserPoolService";
import { TestContext } from "../__tests__/testContext";
import { UserPoolService } from "../services";
import {
  ListIdentityProviders,
  ListIdentityProvidersTarget,
} from "./listIdentityProviders";
import * as TDB from "../__tests__/testDataBuilder";

describe("ListIdentityProviders target", () => {
  let listIdentityProviders: ListIdentityProvidersTarget;
  let mockUserPoolService: jest.Mocked<UserPoolService>;

  beforeEach(() => {
    mockUserPoolService = newMockUserPoolService();
    listIdentityProviders = ListIdentityProviders({
      cognito: newMockCognitoService(mockUserPoolService),
    });
  });

  it("lists groups", async () => {
    const identityProvider1 = TDB.identityProvider();
    const identityProvider2 = TDB.identityProvider();

    mockUserPoolService.listIdentityProviders.mockResolvedValue([
      identityProvider1,
      identityProvider2,
    ]);

    const output = await listIdentityProviders(TestContext, {
      UserPoolId: "userPoolId",
    });

    expect(output).toBeDefined();
    expect(output.Providers).toEqual([
      {
        CreationDate: identityProvider1.CreationDate,
        ProviderName: identityProvider1.ProviderName,
        LastModifiedDate: identityProvider1.LastModifiedDate,
        UserPoolId: "userPoolId",
      },
      {
        CreationDate: identityProvider2.CreationDate,
        ProviderName: identityProvider2.ProviderName,
        LastModifiedDate: identityProvider2.LastModifiedDate,
        UserPoolId: "userPoolId",
      },
    ]);
  });
});
