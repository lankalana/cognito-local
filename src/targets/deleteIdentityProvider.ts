import { DeleteIdentityProviderRequest } from "aws-sdk/clients/cognitoidentityserviceprovider";
import { IdentityProviderNotFoundError } from "../errors";
import { Services } from "../services";
import { Target } from "./Target";

export type DeleteIdentityProviderTarget = Target<
  DeleteIdentityProviderRequest,
  {}
>;

type DeleteIdentityProviderServices = Pick<Services, "cognito">;

export const DeleteIdentityProvider =
  ({ cognito }: DeleteIdentityProviderServices): DeleteIdentityProviderTarget =>
  async (ctx, req) => {
    const userPool = await cognito.getUserPool(ctx, req.UserPoolId);
    const group = await userPool.getIdentityProviderByProviderName(
      ctx,
      req.ProviderName
    );
    if (!group) {
      throw new IdentityProviderNotFoundError();
    }

    await userPool.deleteIdentityProvider(ctx, group);

    return {};
  };
