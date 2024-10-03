import {
  VerifyUserAttributeRequest,
  VerifyUserAttributeResponse,
} from "@aws-sdk/client-cognito-identity-provider";
import jwt from "jsonwebtoken";
import {
  CodeMismatchError,
  InvalidParameterError,
  MissingParameterError,
  NotAuthorizedError,
} from "../errors";
import { Services } from "../services";
import { Token } from "../services/tokenGenerator";
import { attribute, attributesAppend } from "../services/userPoolService";
import { Target } from "./Target";

export type VerifyUserAttributeTarget = Target<
  VerifyUserAttributeRequest,
  VerifyUserAttributeResponse
>;

type VerifyUserAttributeServices = Pick<Services, "clock" | "cognito">;

export const VerifyUserAttribute =
  ({
    clock,
    cognito,
  }: VerifyUserAttributeServices): VerifyUserAttributeTarget =>
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

    if (req.Code !== user.AttributeVerificationCode) {
      throw new CodeMismatchError();
    }

    if (req.AttributeName === "email") {
      await userPool.saveUser(ctx, {
        ...user,
        Attributes: attributesAppend(
          user.Attributes,
          attribute("email_verified", "true"),
        ),
        UserLastModifiedDate: clock.get(),
      });
    } else if (req.AttributeName === "phone_number") {
      await userPool.saveUser(ctx, {
        ...user,
        Attributes: attributesAppend(
          user.Attributes,
          attribute("phone_number_verified", "true"),
        ),
        UserLastModifiedDate: clock.get(),
      });
    } else {
      // not sure what to do here
    }

    return {};
  };
