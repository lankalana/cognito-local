import {
  ListUsersInGroupRequest,
  ListUsersInGroupResponse,
} from '@aws-sdk/client-cognito-identity-provider';

import { GroupNotFoundError, MissingParameterError, UserNotFoundError } from '../errors.js';
import { Services } from '../services/index.js';
import { userToResponseObject } from './responses.js';
import { Target } from './Target.js';

export type ListUsersInGroupTarget = Target<ListUsersInGroupRequest, ListUsersInGroupResponse>;

export const ListUsersInGroup =
  ({ cognito }: Pick<Services, 'cognito'>): ListUsersInGroupTarget =>
  async (ctx, req) => {
    if (!req.UserPoolId) throw new MissingParameterError('UserPoolId');
    if (!req.GroupName) throw new MissingParameterError('GroupName');

    const userPool = await cognito.getUserPool(ctx, req.UserPoolId);
    const group = await userPool.getGroupByGroupName(ctx, req.GroupName);
    if (!group) {
      throw new GroupNotFoundError();
    }

    return {
      Users: await Promise.all(
        group?.members?.map(async (username) => {
          const user = await userPool.getUserByUsername(ctx, username);
          if (!user) {
            throw new UserNotFoundError();
          }

          return userToResponseObject(user);
        }) ?? []
      ),
    };
  };
