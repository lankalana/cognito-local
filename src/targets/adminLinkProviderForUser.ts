import {
  AdminLinkProviderForUserRequest,
  AdminLinkProviderForUserResponse,
} from "aws-sdk/clients/cognitoidentityserviceprovider";
import { Services } from "../services";
import { Target } from "./Target";
import { IdentityProviderNotFoundError } from "../errors";

export type AdminLinkProviderForUserTarget = Target<
  AdminLinkProviderForUserRequest,
  AdminLinkProviderForUserResponse
>;

type AdminLinkProviderForUserServices = Pick<Services, "cognito">;

export const AdminLinkProviderForUser =
  ({
    cognito,
  }: AdminLinkProviderForUserServices): AdminLinkProviderForUserTarget =>
  async (ctx, req) => {
    const userPool = await cognito.getUserPool(ctx, req.UserPoolId);
    if (!req.SourceUser.ProviderName) {
      throw new IdentityProviderNotFoundError();
    }
    const identityProvider = await userPool.getIdentityProviderByProviderName(
      ctx,
      req.SourceUser.ProviderName
    );
    if (!identityProvider) {
      throw new IdentityProviderNotFoundError();
    }

    // TODO:
    ctx.logger.warn("Not really linking user");
    ctx.logger.info(req);

    return {};
  };
