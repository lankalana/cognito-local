import {
  AdminDeleteUserAttributesRequest,
  AdminDeleteUserAttributesResponse,
} from '@aws-sdk/client-cognito-identity-provider';

import { MissingParameterError, NotAuthorizedError } from '../errors.js';
import { Services } from '../services/index.js';
import { attributesRemove } from '../services/userPoolService.js';
import { Target } from './Target.js';

export type AdminDeleteUserAttributesTarget = Target<
  AdminDeleteUserAttributesRequest,
  AdminDeleteUserAttributesResponse
>;

type AdminDeleteUserAttributesServices = Pick<Services, 'clock' | 'cognito'>;

export const AdminDeleteUserAttributes =
  ({ clock, cognito }: AdminDeleteUserAttributesServices): AdminDeleteUserAttributesTarget =>
  async (ctx, req) => {
    if (!req.UserPoolId) throw new MissingParameterError('UserPoolId');
    if (!req.Username) throw new MissingParameterError('Username');
    if (!req.UserAttributeNames) throw new MissingParameterError('UserAttributeNames');

    const userPool = await cognito.getUserPool(ctx, req.UserPoolId);
    const user = await userPool.getUserByUsername(ctx, req.Username);
    if (!user) {
      throw new NotAuthorizedError();
    }

    const updatedUser = {
      ...user,
      Attributes: attributesRemove(user.Attributes, ...req.UserAttributeNames),
      UserLastModifiedDate: clock.get(),
    };

    await userPool.saveUser(ctx, updatedUser);

    return {};
  };
