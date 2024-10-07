import {
  AdminDisableUserRequest,
  AdminDisableUserResponse,
} from "@aws-sdk/client-cognito-identity-provider";
import { MissingParameterError, UserNotFoundError } from "../errors.js";
import { Services } from "../services/index.js";
import { Target } from "./Target.js";

export type AdminDisableUserTarget = Target<
  AdminDisableUserRequest,
  AdminDisableUserResponse
>;

type AdminDisableUserServices = Pick<Services, "cognito" | "clock">;

export const AdminDisableUser =
  ({ cognito, clock }: AdminDisableUserServices): AdminDisableUserTarget =>
  async (ctx, req) => {
    if (!req.UserPoolId) throw new MissingParameterError("UserPoolId");
    if (!req.Username) throw new MissingParameterError("Username");

    const userPool = await cognito.getUserPool(ctx, req.UserPoolId);
    const user = await userPool.getUserByUsername(ctx, req.Username);
    if (!user) {
      throw new UserNotFoundError();
    }

    await userPool.saveUser(ctx, {
      ...user,
      Enabled: false,
      UserLastModifiedDate: clock.get(),
    });

    return {};
  };
