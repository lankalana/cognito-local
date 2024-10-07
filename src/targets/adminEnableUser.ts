import {
  AdminEnableUserRequest,
  AdminEnableUserResponse,
} from "@aws-sdk/client-cognito-identity-provider";
import { MissingParameterError, UserNotFoundError } from "../errors.js";
import { Services } from "../services/index.js";
import { Target } from "./Target.js";

export type AdminEnableUserTarget = Target<
  AdminEnableUserRequest,
  AdminEnableUserResponse
>;

type AdminEnableUserServices = Pick<Services, "cognito" | "clock">;

export const AdminEnableUser =
  ({ cognito, clock }: AdminEnableUserServices): AdminEnableUserTarget =>
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
      Enabled: true,
      UserLastModifiedDate: clock.get(),
    });

    return {};
  };
