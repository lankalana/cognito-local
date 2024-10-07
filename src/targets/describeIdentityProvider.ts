import {
  DescribeIdentityProviderRequest,
  DescribeIdentityProviderResponse,
} from '@aws-sdk/client-cognito-identity-provider';

import { IdentityProviderNotFoundError, MissingParameterError } from '../errors.js';
import { Services } from '../services/index.js';
import { identityProviderToResponseObject } from './responses.js';
import { Target } from './Target.js';

export type DescribeIdentityProviderTarget = Target<
  DescribeIdentityProviderRequest,
  DescribeIdentityProviderResponse
>;

export const DescribeIdentityProvider =
  ({ cognito }: Pick<Services, 'cognito'>): DescribeIdentityProviderTarget =>
  async (ctx, req) => {
    if (!req.UserPoolId) throw new MissingParameterError('UserPoolId');
    if (!req.ProviderName) throw new MissingParameterError('ProviderName');

    const userPool = await cognito.getUserPool(ctx, req.UserPoolId);
    const identityProvider = await userPool.getIdentityProviderByProviderName(
      ctx,
      req.ProviderName
    );
    if (!identityProvider) {
      throw new IdentityProviderNotFoundError();
    }

    return {
      IdentityProvider: identityProviderToResponseObject(req.UserPoolId)(identityProvider),
    };
  };
