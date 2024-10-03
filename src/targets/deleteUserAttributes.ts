import {
  DeleteUserAttributesRequest,
  DeleteUserAttributesResponse,
} from "@aws-sdk/client-cognito-identity-provider";
import jwt from "jsonwebtoken";
import {
  InvalidParameterError,
  MissingParameterError,
  NotAuthorizedError,
} from "../errors";
import { Services } from "../services";
import { Token } from "../services/tokenGenerator";
import { attributesRemove } from "../services/userPoolService";
import { Target } from "./Target";

export type DeleteUserAttributesTarget = Target<
  DeleteUserAttributesRequest,
  DeleteUserAttributesResponse
>;

type DeleteUserAttributesServices = Pick<Services, "clock" | "cognito">;

export const DeleteUserAttributes =
  ({
    clock,
    cognito,
  }: DeleteUserAttributesServices): DeleteUserAttributesTarget =>
  async (ctx, req) => {
    if (!req.AccessToken) throw new MissingParameterError("AccessToken");
    if (!req.UserAttributeNames)
      throw new MissingParameterError("UserAttributeNames");

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

    const updatedUser = {
      ...user,
      Attributes: attributesRemove(user.Attributes, ...req.UserAttributeNames),
      UserLastModifiedDate: clock.get(),
    };

    await userPool.saveUser(ctx, updatedUser);

    return {};
  };
