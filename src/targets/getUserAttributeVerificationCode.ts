import {
  GetUserAttributeVerificationCodeRequest,
  GetUserAttributeVerificationCodeResponse,
} from "@aws-sdk/client-cognito-identity-provider";
import jwt from "jsonwebtoken";
import { Messages, Services, UserPoolService } from "../services/index.js";
import {
  InvalidParameterError,
  MissingParameterError,
  UserNotFoundError,
} from "../errors.js";
import { selectAppropriateDeliveryMethod } from "../services/messageDelivery/deliveryMethod.js";
import { Token } from "../services/tokenGenerator.js";
import { User } from "../services/userPoolService.js";
import { Target } from "./Target.js";
import { Context } from "../services/context.js";

const sendAttributeVerificationCode = async (
  ctx: Context,
  userPool: UserPoolService,
  user: User,
  messages: Messages,
  req: GetUserAttributeVerificationCodeRequest,
  code: string,
) => {
  const deliveryDetails = selectAppropriateDeliveryMethod(
    userPool.options.AutoVerifiedAttributes ?? [],
    user,
  );
  if (!deliveryDetails) {
    // TODO: I don't know what the real error message should be for this
    throw new InvalidParameterError(
      "User has no attribute matching desired auto verified attributes",
    );
  }

  await messages.deliver(
    ctx,
    "VerifyUserAttribute",
    null,
    userPool.options.Id,
    user,
    code,
    req.ClientMetadata,
    deliveryDetails,
  );
};

export type GetUserAttributeVerificationCodeTarget = Target<
  GetUserAttributeVerificationCodeRequest,
  GetUserAttributeVerificationCodeResponse
>;

type GetUserAttributeVerificationCodeServices = Pick<
  Services,
  "cognito" | "otp" | "messages"
>;

export const GetUserAttributeVerificationCode =
  ({
    cognito,
    otp,
    messages,
  }: GetUserAttributeVerificationCodeServices): GetUserAttributeVerificationCodeTarget =>
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
      throw new UserNotFoundError();
    }

    const code = otp();

    await userPool.saveUser(ctx, {
      ...user,
      AttributeVerificationCode: code,
    });

    await sendAttributeVerificationCode(
      ctx,
      userPool,
      user,
      messages,
      req,
      code,
    );

    return {};
  };
