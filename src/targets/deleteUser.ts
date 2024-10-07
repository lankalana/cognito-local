import { DeleteUserRequest } from "@aws-sdk/client-cognito-identity-provider";
import jwt from "jsonwebtoken";
import {
  InvalidParameterError,
  MissingParameterError,
  NotAuthorizedError,
} from "../errors.js";
import { Services } from "../services/index.js";
import { Token } from "../services/tokenGenerator.js";
import { Target } from "./Target.js";

export type DeleteUserTarget = Target<DeleteUserRequest, object>;

type DeleteUserServices = Pick<Services, "cognito">;

export const DeleteUser =
  ({ cognito }: DeleteUserServices): DeleteUserTarget =>
  async (ctx, req) => {
    if (!req.AccessToken) throw new MissingParameterError("AccessToken");

    const decodedToken = jwt.decode(req.AccessToken) as Token | null;
    if (!decodedToken) {
      ctx.logger.info("Unable to decode token");
      throw new InvalidParameterError();
    }

    const userPool = await cognito.getUserPoolForClientId(
      ctx,
      decodedToken.client_id,
    );
    const user = await userPool.getUserByUsername(ctx, decodedToken.sub);
    if (!user) {
      throw new NotAuthorizedError();
    }

    await userPool.deleteUser(ctx, user);

    return {};
  };
