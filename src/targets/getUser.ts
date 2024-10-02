import {
  GetUserRequest,
  GetUserResponse,
} from "@aws-sdk/client-cognito-identity-provider";
import jwt from "jsonwebtoken";
import { InvalidParameterError, MissingParameterError, UserNotFoundError } from "../errors";
import { Services } from "../services";
import { Token } from "../services/tokenGenerator";
import { Target } from "./Target";

export type GetUserTarget = Target<GetUserRequest, GetUserResponse>;

export const GetUser =
  ({ cognito }: Pick<Services, "cognito">): GetUserTarget =>
  async (ctx, req) => {
    if (!req.AccessToken) throw new MissingParameterError("AccessToken");

    const decodedToken = jwt.decode(req.AccessToken) as Token | null;
    if (!decodedToken) {
      ctx.logger.info("Unable to decode token");
      throw new InvalidParameterError();
    }

    const userPool = await cognito.getUserPoolForClientId(
      ctx,
      decodedToken.client_id
    );
    const user = await userPool.getUserByUsername(ctx, decodedToken.sub);
    if (!user) {
      throw new UserNotFoundError();
    }

    return {
      MFAOptions: user.MFAOptions,
      PreferredMfaSetting: user.PreferredMfaSetting,
      UserAttributes: user.Attributes,
      UserMFASettingList: user.UserMFASettingList,
      Username: user.Username,
    };
  };
