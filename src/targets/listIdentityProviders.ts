import {
  ListIdentityProvidersRequest,
  ListIdentityProvidersResponse,
} from "@aws-sdk/client-cognito-identity-provider";
import { Services } from "../services/index.js";
import { identityProviderToResponseObject } from "./responses.js";
import { Target } from "./Target.js";
import { MissingParameterError } from "../errors.js";

export type ListIdentityProvidersTarget = Target<
  ListIdentityProvidersRequest,
  ListIdentityProvidersResponse
>;

type ListIdentityProviderservices = Pick<Services, "cognito">;

export const ListIdentityProviders =
  ({ cognito }: ListIdentityProviderservices): ListIdentityProvidersTarget =>
  async (ctx, req) => {
    if (!req.UserPoolId) throw new MissingParameterError("UserPoolId");

    const userPool = await cognito.getUserPool(ctx, req.UserPoolId);
    const identityProviders = await userPool.listIdentityProviders(ctx);

    return {
      Providers: identityProviders.map(
        identityProviderToResponseObject(req.UserPoolId),
      ),
    };
  };
