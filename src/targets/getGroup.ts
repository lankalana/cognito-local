import { GetGroupRequest, GetGroupResponse } from '@aws-sdk/client-cognito-identity-provider';

import { GroupNotFoundError, MissingParameterError } from '../errors.js';
import { Services } from '../services/index.js';
import { groupToResponseObject } from './responses.js';
import { Target } from './Target.js';

export type GetGroupTarget = Target<GetGroupRequest, GetGroupResponse>;

export const GetGroup =
  ({ cognito }: Pick<Services, 'cognito'>): GetGroupTarget =>
  async (ctx, req) => {
    if (!req.UserPoolId) throw new MissingParameterError('UserPoolId');
    if (!req.GroupName) throw new MissingParameterError('GroupName');

    const userPool = await cognito.getUserPool(ctx, req.UserPoolId);
    const group = await userPool.getGroupByGroupName(ctx, req.GroupName);
    if (!group) {
      throw new GroupNotFoundError();
    }

    return {
      Group: groupToResponseObject(req.UserPoolId)(group),
    };
  };
