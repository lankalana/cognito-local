import { ListUsersRequest, ListUsersResponse } from '@aws-sdk/client-cognito-identity-provider';

import { MissingParameterError } from '../errors.js';
import { Services } from '../services/index.js';
import { userToResponseObject } from './responses.js';
import { Target } from './Target.js';

export type ListUsersTarget = Target<ListUsersRequest, ListUsersResponse>;

export const ListUsers =
  ({ cognito }: Pick<Services, 'cognito'>): ListUsersTarget =>
  async (ctx, req) => {
    if (!req.UserPoolId) throw new MissingParameterError('UserPoolId');

    const userPool = await cognito.getUserPool(ctx, req.UserPoolId);
    const users = await userPool.listUsers(ctx, req.Filter);

    // TODO: support AttributesToGet
    // TODO: support Filter
    // TODO: support Limit
    // TODO: support PaginationToken

    return {
      Users: users.map(userToResponseObject),
    };
  };
