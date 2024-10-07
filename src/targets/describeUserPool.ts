import {
  DescribeUserPoolRequest,
  DescribeUserPoolResponse,
} from '@aws-sdk/client-cognito-identity-provider';

import { MissingParameterError, ResourceNotFoundError } from '../errors.js';
import { Services } from '../services/index.js';
import { userPoolToResponseObject } from './responses.js';
import { Target } from './Target.js';

export type DescribeUserPoolTarget = Target<DescribeUserPoolRequest, DescribeUserPoolResponse>;

export const DescribeUserPool =
  ({ cognito }: Pick<Services, 'cognito'>): DescribeUserPoolTarget =>
  async (ctx, req) => {
    if (!req.UserPoolId) throw new MissingParameterError('UserPoolId');

    const userPool = await cognito.getUserPool(ctx, req.UserPoolId);
    if (!userPool) {
      throw new ResourceNotFoundError();
    }

    return {
      UserPool: userPoolToResponseObject(userPool.options),
    };
  };
