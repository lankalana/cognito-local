import { newMockCognitoService } from '../__tests__/mockCognitoService.js';
import { newMockUserPoolService } from '../__tests__/mockUserPoolService.js';
import { TestContext } from '../__tests__/testContext.js';
import * as TDB from '../__tests__/testDataBuilder.js';
import { IdentityProviderNotFoundError } from '../errors.js';
import { UserPoolService } from '../services/index.js';
import {
  DescribeIdentityProvider,
  DescribeIdentityProviderTarget,
} from './describeIdentityProvider.js';

describe('DescribeIdentityProvider target', () => {
  let describeIdentityProvider: DescribeIdentityProviderTarget;
  let mockUserPoolService: jest.Mocked<UserPoolService>;

  beforeEach(() => {
    mockUserPoolService = newMockUserPoolService();

    describeIdentityProvider = DescribeIdentityProvider({
      cognito: newMockCognitoService(mockUserPoolService),
    });
  });

  it('gets a group', async () => {
    const existingGroup = TDB.identityProvider();

    mockUserPoolService.getIdentityProviderByProviderName.mockResolvedValue(existingGroup);

    const result = await describeIdentityProvider(TestContext, {
      ProviderName: existingGroup.ProviderName,
      UserPoolId: 'test',
    });

    expect(mockUserPoolService.getIdentityProviderByProviderName).toHaveBeenCalledWith(
      TestContext,
      existingGroup.ProviderName
    );

    expect(result.IdentityProvider).toEqual({
      ProviderName: existingGroup.ProviderName,
      ProviderType: existingGroup.ProviderType,
      ProviderDetails: existingGroup.ProviderDetails,
      AttributeMapping: existingGroup.AttributeMapping,
      IdpIdentifiers: existingGroup.IdpIdentifiers,
      LastModifiedDate: existingGroup.LastModifiedDate,
      CreationDate: existingGroup.CreationDate,
      UserPoolId: 'test',
    });
  });

  it("throws if the identity provider doesn't exist", async () => {
    mockUserPoolService.getIdentityProviderByProviderName.mockResolvedValue(null);

    await expect(
      describeIdentityProvider(TestContext, {
        ProviderName: 'identityProvider',
        UserPoolId: 'test',
      })
    ).rejects.toEqual(new IdentityProviderNotFoundError());
  });
});
