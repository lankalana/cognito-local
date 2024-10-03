import {
  AdminConfirmSignUpRequest,
  AdminConfirmSignUpResponse,
  UserStatusType,
} from "@aws-sdk/client-cognito-identity-provider";
import { Services } from "../services";
import { MissingParameterError, NotAuthorizedError } from "../errors";
import { attribute, attributesAppend } from "../services/userPoolService";
import { Target } from "./Target";

export type AdminConfirmSignUpTarget = Target<
  AdminConfirmSignUpRequest,
  AdminConfirmSignUpResponse
>;

type AdminConfirmSignUpServices = Pick<
  Services,
  "clock" | "cognito" | "triggers"
>;

export const AdminConfirmSignUp =
  ({
    clock,
    cognito,
    triggers,
  }: AdminConfirmSignUpServices): AdminConfirmSignUpTarget =>
  async (ctx, req) => {
    if (!req.UserPoolId) throw new MissingParameterError("UserPoolId");
    if (!req.Username) throw new MissingParameterError("Username");

    const userPool = await cognito.getUserPool(ctx, req.UserPoolId);
    const user = await userPool.getUserByUsername(ctx, req.Username);
    if (!user) {
      throw new NotAuthorizedError();
    }

    if (user.UserStatus !== UserStatusType.UNCONFIRMED) {
      throw new NotAuthorizedError(
        `User cannot be confirmed. Current status is ${user.UserStatus}`,
      );
    }

    const updatedUser = {
      ...user,
      UserLastModifiedDate: clock.get(),
      UserStatus: UserStatusType.CONFIRMED,
    };

    await userPool.saveUser(ctx, updatedUser);

    if (triggers.enabled("PostConfirmation")) {
      await triggers.postConfirmation(ctx, {
        source: "PostConfirmation_ConfirmSignUp",
        clientId: null,
        clientMetadata: req.ClientMetadata,
        username: updatedUser.Username,
        userPoolId: req.UserPoolId,

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
