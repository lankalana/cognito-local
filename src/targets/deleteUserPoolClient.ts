import { DeleteUserPoolClientRequest } from "@aws-sdk/client-cognito-identity-provider";
import { MissingParameterError, ResourceNotFoundError } from "../errors";
import { Services } from "../services";
import { Target } from "./Target";

export type DeleteUserPoolClientTarget = Target<
  DeleteUserPoolClientRequest,
  object
>;

type DeleteUserPoolClientServices = Pick<Services, "cognito">;

export const DeleteUserPoolClient =
  ({ cognito }: DeleteUserPoolClientServices): DeleteUserPoolClientTarget =>
  async (ctx, req) => {
    if (!req.UserPoolId) throw new MissingParameterError("UserPoolId");
    if (!req.ClientId) throw new MissingParameterError("ClientId");

    // TODO: from the docs "Calling this action requires developer credentials.", can we enforce this?

    const userPool = await cognito.getUserPool(ctx, req.UserPoolId);
    const appClient = await cognito.getAppClient(ctx, req.ClientId);
    if (!appClient || appClient.UserPoolId !== req.UserPoolId) {
      throw new ResourceNotFoundError();
    }

    await userPool.deleteAppClient(ctx, appClient);

    return {};
  };
