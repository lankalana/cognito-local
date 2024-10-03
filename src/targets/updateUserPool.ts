import {
  UpdateUserPoolRequest,
  UpdateUserPoolResponse,
} from "@aws-sdk/client-cognito-identity-provider";
import { Services } from "../services";
import { UserPool } from "../services/userPoolService";
import { Target } from "./Target";
import { MissingParameterError } from "../errors";

export type UpdateUserPoolTarget = Target<
  UpdateUserPoolRequest,
  UpdateUserPoolResponse
>;

type UpdateUserPoolServices = Pick<Services, "cognito">;

export const UpdateUserPool =
  ({ cognito }: UpdateUserPoolServices): UpdateUserPoolTarget =>
  async (ctx, req) => {
    if (!req.UserPoolId) throw new MissingParameterError("UserPoolId");
    
    const userPool = await cognito.getUserPool(ctx, req.UserPoolId);

    const updatedUserPool: UserPool = {
      ...userPool.options,
      AccountRecoverySetting: req.AccountRecoverySetting,
      AdminCreateUserConfig: req.AdminCreateUserConfig,
      AutoVerifiedAttributes: req.AutoVerifiedAttributes,
      DeviceConfiguration: req.DeviceConfiguration,
      EmailConfiguration: req.EmailConfiguration,
      EmailVerificationMessage: req.EmailVerificationMessage,
      EmailVerificationSubject: req.EmailVerificationSubject,
      LambdaConfig: req.LambdaConfig,
      MfaConfiguration: req.MfaConfiguration,
      Policies: req.Policies,
      SmsAuthenticationMessage: req.SmsAuthenticationMessage,
      SmsConfiguration: req.SmsConfiguration,
      SmsVerificationMessage: req.SmsVerificationMessage,
      UserPoolAddOns: req.UserPoolAddOns,
      UserPoolTags: req.UserPoolTags,
      VerificationMessageTemplate: req.VerificationMessageTemplate,
    };

    await userPool.updateOptions(ctx, updatedUserPool);

    return {};
  };
