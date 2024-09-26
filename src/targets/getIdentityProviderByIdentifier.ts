import {
  GetIdentityProviderByIdentifierRequest,
  GetIdentityProviderByIdentifierResponse,
} from "aws-sdk/clients/cognitoidentityserviceprovider";
import { IdentityProviderNotFoundError } from "../errors";
import { Services } from "../services";
import { identityProviderToResponseObject } from "./responses";
import { Target } from "./Target";

export type GetIdentityProviderByIdentifierTarget = Target<
  GetIdentityProviderByIdentifierRequest,
  GetIdentityProviderByIdentifierResponse
>;

export const GetIdentityProviderByIdentifier =
  ({
    cognito,
  }: Pick<Services, "cognito">): GetIdentityProviderByIdentifierTarget =>
  async (ctx, req) => {
    const userPool = await cognito.getUserPool(ctx, req.UserPoolId);
    const identityProvider = await userPool.getIdentityProviderByIdentifier(
      ctx,
      req.IdpIdentifier
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
