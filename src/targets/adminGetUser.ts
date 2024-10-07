import {
  AdminGetUserRequest,
  AdminGetUserResponse,
} from "@aws-sdk/client-cognito-identity-provider";
import { MissingParameterError, UserNotFoundError } from "../errors.js";
import { Services } from "../services/index.js";
import { Target } from "./Target.js";

export type AdminGetUserTarget = Target<
  AdminGetUserRequest,
  AdminGetUserResponse
>;

type AdminGetUserServices = Pick<Services, "cognito">;

export const AdminGetUser =
  ({ cognito }: AdminGetUserServices): AdminGetUserTarget =>
  async (ctx, req) => {
    if (!req.UserPoolId) throw new MissingParameterError("UserPoolId");
    if (!req.Username) throw new MissingParameterError("Username");

    const userPool = await cognito.getUserPool(ctx, req.UserPoolId);
    const user = await userPool.getUserByUsername(ctx, req.Username);
    if (!user) {
      throw new UserNotFoundError("User does not exist.");
    }

    return {
      Enabled: user.Enabled,
      MFAOptions: user.MFAOptions,
      PreferredMfaSetting: undefined,
      UserAttributes: user.Attributes,
      UserCreateDate: user.UserCreateDate,
      UserLastModifiedDate: user.UserLastModifiedDate,
      UserMFASettingList: undefined,
      Username: user.Username,
      UserStatus: user.UserStatus,
    };
  };
