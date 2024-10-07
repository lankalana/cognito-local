import {
  AdminSetUserPasswordRequest,
  AdminSetUserPasswordResponse,
} from '@aws-sdk/client-cognito-identity-provider';

import { MissingParameterError, UserNotFoundError } from '../errors.js';
import { Services } from '../services/index.js';
import { Target } from './Target.js';

export type AdminSetUserPasswordTarget = Target<
  AdminSetUserPasswordRequest,
  AdminSetUserPasswordResponse
>;

type AdminSetUserPasswordServices = Pick<Services, 'clock' | 'cognito'>;

export const AdminSetUserPassword =
  ({ cognito, clock }: AdminSetUserPasswordServices): AdminSetUserPasswordTarget =>
  async (ctx, req) => {
    if (!req.UserPoolId) throw new MissingParameterError('UserPoolId');
    if (!req.Username) throw new MissingParameterError('Username');
    if (!req.Password) throw new MissingParameterError('Password');

    const userPool = await cognito.getUserPool(ctx, req.UserPoolId);
    const user = await userPool.getUserByUsername(ctx, req.Username);
    if (!user) {
      throw new UserNotFoundError('User does not exist');
    }

    await userPool.saveUser(ctx, {
      ...user,
      Password: req.Password,
      UserLastModifiedDate: clock.get(),
      UserStatus: req.Permanent ? 'CONFIRMED' : 'FORCE_CHANGE_PASSWORD',
    });

    return {};
  };
