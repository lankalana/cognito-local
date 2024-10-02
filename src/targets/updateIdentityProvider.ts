import {
  UpdateIdentityProviderRequest,
  UpdateIdentityProviderResponse,
} from "aws-sdk/clients/cognitoidentityserviceprovider";
import { Services } from "../services";
import { IdentityProviderNotFoundError } from "../errors";
import { identityProviderToResponseObject } from "./responses";
import { Target } from "./Target";

export type UpdateIdentityProviderTarget = Target<
  UpdateIdentityProviderRequest,
  UpdateIdentityProviderResponse
>;

type UpdateIdentityProviderServices = Pick<Services, "clock" | "cognito">;

export const UpdateIdentityProvider =
  ({
    clock,
    cognito,
  }: UpdateIdentityProviderServices): UpdateIdentityProviderTarget =>
  async (ctx, req) => {
    const userPool = await cognito.getUserPool(ctx, req.UserPoolId);
    const identityProvider = await userPool.getIdentityProviderByProviderName(
      ctx,
      req.ProviderName
    );
    if (!identityProvider) {
      throw new IdentityProviderNotFoundError();
    }

    const updatedIdentityProvider = {
      ...identityProvider,
      ProviderDetails: req.ProviderDetails ?? identityProvider.ProviderDetails,
      AttributeMapping:
        req.AttributeMapping ?? identityProvider.AttributeMapping,
      IdpIdentifiers: req.IdpIdentifiers ?? identityProvider.IdpIdentifiers,
      LastModifiedDate: clock.get(),
    };

    await userPool.saveIdentityProvider(ctx, updatedIdentityProvider);

    return {
      IdentityProvider: identityProviderToResponseObject(req.UserPoolId)(
        updatedIdentityProvider
      ),
    };
  };
