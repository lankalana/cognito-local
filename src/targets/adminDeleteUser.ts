import { AdminDeleteUserRequest } from "@aws-sdk/client-cognito-identity-provider";
import { Services } from "../services/index.js";
import { MissingParameterError, UserNotFoundError } from "../errors.js";
import { Target } from "./Target.js";

export type AdminDeleteUserTarget = Target<AdminDeleteUserRequest, object>;

type AdminDeleteUserServices = Pick<Services, "cognito">;

export const AdminDeleteUser =
  ({ cognito }: AdminDeleteUserServices): AdminDeleteUserTarget =>
  async (ctx, req) => {
    if (!req.UserPoolId) throw new MissingParameterError("UserPoolId");
    if (!req.Username) throw new MissingParameterError("Username");

    const userPool = await cognito.getUserPool(ctx, req.UserPoolId);
    const user = await userPool.getUserByUsername(ctx, req.Username);
    if (!user) {
      throw new UserNotFoundError("User does not exist");
    }

    await userPool.deleteUser(ctx, user);

    return {};
  };
