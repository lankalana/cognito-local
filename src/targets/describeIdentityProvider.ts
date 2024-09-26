import {
  DescribeIdentityProviderRequest,
  DescribeIdentityProviderResponse,
} from "aws-sdk/clients/cognitoidentityserviceprovider";
import { IdentityProviderNotFoundError } from "../errors";
import { Services } from "../services";
import { identityProviderToResponseObject } from "./responses";
import { Target } from "./Target";

export type DescribeIdentityProviderTarget = Target<
  DescribeIdentityProviderRequest,
  DescribeIdentityProviderResponse
>;

export const DescribeIdentityProvider =
  ({ cognito }: Pick<Services, "cognito">): DescribeIdentityProviderTarget =>
  async (ctx, req) => {
    const userPool = await cognito.getUserPool(ctx, req.UserPoolId);
    const identityProvider = await userPool.getIdentityProviderByProviderName(
      ctx,
      req.ProviderName
    );
    if (!identityProvider) {
      throw new IdentityProviderNotFoundError();
    }

    return {
      IdentityProvider: identityProviderToResponseObject(req.UserPoolId)(
        identityProvider
      ),
    };
  };
