import {
  GetUserPoolMfaConfigRequest,
  GetUserPoolMfaConfigResponse,
} from '@aws-sdk/client-cognito-identity-provider';

import { MissingParameterError } from '../errors.js';
import { Services } from '../services/index.js';
import { Target } from './Target.js';

export type GetUserPoolMfaConfigTarget = Target<
  GetUserPoolMfaConfigRequest,
  GetUserPoolMfaConfigResponse
>;

type GetUserPoolMfaConfigServices = Pick<Services, 'cognito'>;

export const GetUserPoolMfaConfig =
  ({ cognito }: GetUserPoolMfaConfigServices): GetUserPoolMfaConfigTarget =>
  async (ctx, req) => {
    if (!req.UserPoolId) throw new MissingParameterError('UserPoolId');

    const userPool = await cognito.getUserPool(ctx, req.UserPoolId);

    return {
      MfaConfiguration: userPool.options.MfaConfiguration,
      SmsMfaConfiguration: {
        SmsAuthenticationMessage: userPool.options.SmsAuthenticationMessage,
        SmsConfiguration: userPool.options.SmsConfiguration,
      },
      SoftwareTokenMfaConfiguration: {
        Enabled: false,
      },
    };
  };
