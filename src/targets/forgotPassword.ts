import {
  ForgotPasswordRequest,
  ForgotPasswordResponse,
} from "@aws-sdk/client-cognito-identity-provider";
import {
  MissingParameterError,
  UnsupportedError,
  UserNotFoundError,
} from "../errors.js";
import { Services } from "../services/index.js";
import { DeliveryDetails } from "../services/messageDelivery/messageDelivery.js";
import { attributeValue } from "../services/userPoolService.js";
import { Target } from "./Target.js";

export type ForgotPasswordTarget = Target<
  ForgotPasswordRequest,
  ForgotPasswordResponse
>;

type ForgotPasswordServices = Pick<
  Services,
  "cognito" | "clock" | "messages" | "otp"
>;

export const ForgotPassword =
  ({
    cognito,
    clock,
    messages,
    otp,
  }: ForgotPasswordServices): ForgotPasswordTarget =>
  async (ctx, req) => {
    if (!req.ClientId) throw new MissingParameterError("ClientId");
    if (!req.Username) throw new MissingParameterError("Username");

    const userPool = await cognito.getUserPoolForClientId(ctx, req.ClientId);
    const user = await userPool.getUserByUsername(ctx, req.Username);
    if (!user) {
      throw new UserNotFoundError();
    }

    const userEmail = attributeValue("email", user.Attributes);
    if (!userEmail) {
      throw new UnsupportedError("ForgotPassword without email on user");
    }

    // TODO: support UserMigration trigger

    const deliveryDetails: DeliveryDetails = {
      AttributeName: "email",
      DeliveryMedium: "EMAIL",
      Destination: userEmail,
    };

    const code = otp();
    await messages.deliver(
      ctx,
      "ForgotPassword",
      req.ClientId,
      userPool.options.Id,
      user,
      code,
      req.ClientMetadata,
      deliveryDetails,
    );

    await userPool.saveUser(ctx, {
      ...user,
      UserLastModifiedDate: clock.get(),
      ConfirmationCode: code,
    });

    return {
      CodeDeliveryDetails: deliveryDetails,
    };
  };
