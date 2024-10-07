import {
  ConfirmSignUpRequest,
  ConfirmSignUpResponse,
  UserStatusType,
} from "@aws-sdk/client-cognito-identity-provider";
import {
  CodeMismatchError,
  ExpiredCodeError,
  MissingParameterError,
  NotAuthorizedError,
} from "../errors.js";
import { Services } from "../services/index.js";
import { attribute, attributesAppend } from "../services/userPoolService.js";
import { Target } from "./Target.js";

export type ConfirmSignUpTarget = Target<
  ConfirmSignUpRequest,
  ConfirmSignUpResponse
>;

export const ConfirmSignUp =
  ({
    cognito,
    clock,
    triggers,
  }: Pick<Services, "cognito" | "clock" | "triggers">): ConfirmSignUpTarget =>
  async (ctx, req) => {
    if (!req.ClientId) throw new MissingParameterError("ClientId");
    if (!req.Username) throw new MissingParameterError("Username");

    const userPool = await cognito.getUserPoolForClientId(ctx, req.ClientId);
    const user = await userPool.getUserByUsername(ctx, req.Username);
    if (!user) {
      throw new NotAuthorizedError();
    }

    if (!user.ConfirmationCode) {
      throw new ExpiredCodeError();
    }

    if (user.ConfirmationCode !== req.ConfirmationCode) {
      throw new CodeMismatchError();
    }

    const updatedUser = {
      ...user,
      UserStatus: UserStatusType.CONFIRMED,
      ConfirmationCode: undefined,
      UserLastModifiedDate: clock.get(),
    };

    await userPool.saveUser(ctx, updatedUser);

    if (triggers.enabled("PostConfirmation")) {
      await triggers.postConfirmation(ctx, {
        clientId: req.ClientId,
        clientMetadata: req.ClientMetadata,
        source: "PostConfirmation_ConfirmSignUp",
        username: updatedUser.Username,
        userPoolId: userPool.options.Id,

        // not sure whether this is a one off for PostConfirmation, or whether we should be adding cognito:user_status
        // into every place we send attributes to lambdas
        userAttributes: attributesAppend(
          updatedUser.Attributes,
          attribute("cognito:user_status", updatedUser.UserStatus),
        ),
      });
    }

    return {};
  };
