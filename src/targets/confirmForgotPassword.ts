import {
  ConfirmForgotPasswordRequest,
  ConfirmForgotPasswordResponse,
  UserStatusType,
} from "@aws-sdk/client-cognito-identity-provider";
import { CodeMismatchError, MissingParameterError, UserNotFoundError } from "../errors";
import { Services } from "../services";
import { attribute, attributesAppend } from "../services/userPoolService";
import { Target } from "./Target";

export type ConfirmForgotPasswordTarget = Target<
  ConfirmForgotPasswordRequest,
  ConfirmForgotPasswordResponse
>;

type ConfirmForgotPasswordServices = Pick<
  Services,
  "cognito" | "clock" | "triggers"
>;

export const ConfirmForgotPassword =
  ({
    cognito,
    clock,
    triggers,
  }: ConfirmForgotPasswordServices): ConfirmForgotPasswordTarget =>
  async (ctx, req) => {
    if (!req.ClientId) throw new MissingParameterError("ClientId");
    if (!req.Username) throw new MissingParameterError("Username");
    if (!req.Password) throw new MissingParameterError("Password");
    
    const userPool = await cognito.getUserPoolForClientId(ctx, req.ClientId);
    const user = await userPool.getUserByUsername(ctx, req.Username);
    if (!user) {
      throw new UserNotFoundError();
    }

    if (user.ConfirmationCode !== req.ConfirmationCode) {
      throw new CodeMismatchError();
    }

    const updatedUser = {
      ...user,
      UserLastModifiedDate: clock.get(),
      UserStatus: UserStatusType.CONFIRMED,
      ConfirmationCode: undefined,
      Password: req.Password,
    };

    await userPool.saveUser(ctx, updatedUser);

    if (triggers.enabled("PostConfirmation")) {
      await triggers.postConfirmation(ctx, {
        clientId: req.ClientId,
        clientMetadata: req.ClientMetadata,
        source: "PostConfirmation_ConfirmForgotPassword",
        username: updatedUser.Username,
        userPoolId: userPool.options.Id,

        // not sure whether this is a one off for PostConfirmation, or whether we should be adding cognito:user_status
        // into every place we send attributes to lambdas
        userAttributes: attributesAppend(
          updatedUser.Attributes,
          attribute("cognito:user_status", updatedUser.UserStatus)
        ),
      });
    }

    return {};
  };
