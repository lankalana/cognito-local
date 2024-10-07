import { AttributeType } from "@aws-sdk/client-cognito-identity-provider";
import { Lambda } from "../lambda.js";
import { attributesToRecord } from "../userPoolService.js";
import { Trigger } from "./trigger.js";

export type PostConfirmationTrigger = Trigger<
  {
    source:
      | "PostConfirmation_ConfirmSignUp"
      | "PostConfirmation_ConfirmForgotPassword";
    clientId: string | null;

    /**
     * One or more key-value pairs that you can provide as custom input to the Lambda function that you specify for the
     * post confirmation trigger. You can pass this data to your Lambda function by using the ClientMetadata parameter in
     * the following API actions: AdminConfirmSignUp, ConfirmForgotPassword, ConfirmSignUp, and SignUp.
     *
     * source: https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-lambda-post-confirmation.html#cognito-user-pools-lambda-trigger-syntax-post-confirmation
     */
    clientMetadata?: Record<string, string>;
    userAttributes: AttributeType[];
    username: string;
    userPoolId: string;
  },
  void
>;

interface PostConfirmationServices {
  lambda: Lambda;
}

export const PostConfirmation =
  ({ lambda }: PostConfirmationServices): PostConfirmationTrigger =>
  async (
    ctx,
    { clientId, clientMetadata, source, userAttributes, username, userPoolId },
  ) => {
    try {
      await lambda.invoke(ctx, "PostConfirmation", {
        clientId,
        clientMetadata,
        triggerSource: source,
        userAttributes: attributesToRecord(userAttributes),
        username,
        userPoolId,
      });
    } catch (ex) {
      ctx.logger.error(ex);
    }
  };
