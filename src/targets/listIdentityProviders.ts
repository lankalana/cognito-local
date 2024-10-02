import {
  ListIdentityProvidersRequest,
  ListIdentityProvidersResponse,
} from "aws-sdk/clients/cognitoidentityserviceprovider";
import { Services } from "../services";
import { identityProviderToResponseObject } from "./responses";
import { Target } from "./Target";

export type ListIdentityProvidersTarget = Target<
  ListIdentityProvidersRequest,
  ListIdentityProvidersResponse
>;

type ListIdentityProviderservices = Pick<Services, "cognito">;

export const ListIdentityProviders =
  ({ cognito }: ListIdentityProviderservices): ListIdentityProvidersTarget =>
  async (ctx, req) => {
    const userPool = await cognito.getUserPool(ctx, req.UserPoolId);
    const identityProviders = await userPool.listIdentityProviders(ctx);

    return {
      Providers: identityProviders.map(
        identityProviderToResponseObject(req.UserPoolId)
      ),
    };
  };
