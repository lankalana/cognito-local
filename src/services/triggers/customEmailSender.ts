import { AttributeType } from "@aws-sdk/client-cognito-identity-provider";
import { CryptoService } from "../crypto.js";
import { CustomEmailSenderTriggerResponse, Lambda } from "../lambda.js";
import { attributesToRecord } from "../userPoolService.js";
import { Trigger } from "./trigger.js";

export type CustomEmailSenderTrigger = Trigger<
  {
    code: string;
    source:
      | "CustomEmailSender_SignUp"
      | "CustomEmailSender_ResendCode"
      | "CustomEmailSender_ForgotPassword"
      | "CustomEmailSender_UpdateUserAttribute"
      | "CustomEmailSender_VerifyUserAttribute"
      | "CustomEmailSender_AdminCreateUser";
    userPoolId: string;
    clientId: string | undefined;
    username: string;
    userAttributes: AttributeType[];

    /**
     * One or more key-value pairs that you can provide as custom input to the Lambda function that you specify for the
     * custom message trigger. You can pass this data to your Lambda function by using the ClientMetadata parameter in the
     * following API actions:
     *
     * - AdminResetUserPassword
     * - AdminRespondToAuthChallenge
     * - AdminUpdateUserAttributes
     * - ForgotPassword
     * - GetUserAttributeVerificationCode
     * - ResendConfirmationCode
     * - SignUp
     * - UpdateUserAttributes
     *
     * Source: https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-lambda-custom-message.html#cognito-user-pools-lambda-trigger-syntax-custom-message
     */
    clientMetadata: Record<string, string> | undefined;
  },
  CustomEmailSenderTriggerResponse | null
>;

interface CustomEmailSenderServices {
  lambda: Lambda;
  crypto: CryptoService;
}

export const CustomEmailSender =
  ({ lambda, crypto }: CustomEmailSenderServices): CustomEmailSenderTrigger =>
  async (
    ctx,
    {
      clientId,
      clientMetadata,
      code,
      source,
      userAttributes,
      username,
      userPoolId,
    },
  ) => {
    try {
      const encrypted = await crypto.encrypt(ctx, code);

      await lambda.invoke(ctx, "CustomEmailSender", {
        code: encrypted,
        clientId,
        clientMetadata,
        triggerSource: source,
        userAttributes: attributesToRecord(userAttributes),
        username,
        userPoolId,
      });

      return {};
    } catch (ex) {
      ctx.logger.error(ex);
      return null;
    }
  };
