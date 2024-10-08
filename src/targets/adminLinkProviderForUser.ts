import {
  AdminLinkProviderForUserRequest,
  AdminLinkProviderForUserResponse,
} from '@aws-sdk/client-cognito-identity-provider';

import { IdentityProviderNotFoundError, MissingParameterError } from '../errors.js';
import { Services } from '../services/index.js';
import { Target } from './Target.js';

export type AdminLinkProviderForUserTarget = Target<
  AdminLinkProviderForUserRequest,
  AdminLinkProviderForUserResponse
>;

type AdminLinkProviderForUserServices = Pick<Services, 'cognito'>;

export const AdminLinkProviderForUser =
  ({ cognito }: AdminLinkProviderForUserServices): AdminLinkProviderForUserTarget =>
  async (ctx, req) => {
    if (!req.UserPoolId) throw new MissingParameterError('UserPoolId');
    if (!req.SourceUser) throw new MissingParameterError('SourceUser');

    const userPool = await cognito.getUserPool(ctx, req.UserPoolId);
    if (!req.SourceUser.ProviderName) {
      throw new IdentityProviderNotFoundError();
    }
    const identityProvider = await userPool.getIdentityProviderByProviderName(
      ctx,
      req.SourceUser.ProviderName
    );
    if (!identityProvider) {
      throw new IdentityProviderNotFoundError();
    }

    // TODO:
    ctx.logger.warn('Not really linking user');
    ctx.logger.info(req);

    return {};
  };
