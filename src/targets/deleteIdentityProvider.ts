import { DeleteIdentityProviderRequest } from "@aws-sdk/client-cognito-identity-provider";
import {
  IdentityProviderNotFoundError,
  MissingParameterError,
} from "../errors.js";
import { Services } from "../services/index.js";
import { Target } from "./Target.js";

export type DeleteIdentityProviderTarget = Target<
  DeleteIdentityProviderRequest,
  object
>;

type DeleteIdentityProviderServices = Pick<Services, "cognito">;

export const DeleteIdentityProvider =
  ({ cognito }: DeleteIdentityProviderServices): DeleteIdentityProviderTarget =>
  async (ctx, req) => {
    if (!req.UserPoolId) throw new MissingParameterError("UserPoolId");
    if (!req.ProviderName) throw new MissingParameterError("ProviderName");

    const userPool = await cognito.getUserPool(ctx, req.UserPoolId);
    const group = await userPool.getIdentityProviderByProviderName(
      ctx,
      req.ProviderName,
    );
    if (!group) {
      throw new IdentityProviderNotFoundError();
    }

    await userPool.deleteIdentityProvider(ctx, group);

    return {};
  };
