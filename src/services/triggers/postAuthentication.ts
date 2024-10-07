import { AttributeType } from "@aws-sdk/client-cognito-identity-provider";
import { Lambda } from "../lambda.js";
import { attributesToRecord } from "../userPoolService.js";
import { Trigger } from "./trigger.js";

export type PostAuthenticationTrigger = Trigger<
  {
    clientId: string;
    /**
     * One or more key-value pairs that you can provide as custom input to the Lambda function that you specify for the
     * post authentication trigger. You can pass this data to your Lambda function by using the ClientMetadata parameter
     * in the AdminRespondToAuthChallenge and RespondToAuthChallenge API actions.
     *
     * Source: https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-lambda-post-authentication.html
     */
    clientMetadata: Record<string, string> | undefined;
    source: "PostAuthentication_Authentication";
    userAttributes: AttributeType[];
    username: string;
    userPoolId: string;
  },
  void
>;

type PostAuthenticationServices = {
  lambda: Lambda;
};

export const PostAuthentication =
  ({ lambda }: PostAuthenticationServices): PostAuthenticationTrigger =>
  async (
    ctx,
    { clientId, clientMetadata, source, userAttributes, username, userPoolId },
  ) => {
    try {
      await lambda.invoke(ctx, "PostAuthentication", {
        clientId,
        clientMetadata,
        triggerSource: source,
        userAttributes: attributesToRecord(userAttributes),
        username,
        userPoolId,
      });
    } catch (err) {
      ctx.logger.warn(err, "PostAuthentication error, ignored");
    }
  };
