import {
  UpdateIdentityProviderRequest,
  UpdateIdentityProviderResponse,
} from "@aws-sdk/client-cognito-identity-provider";
import { Services } from "../services/index.js";
import {
  IdentityProviderNotFoundError,
  MissingParameterError,
} from "../errors.js";
import { identityProviderToResponseObject } from "./responses.js";
import { Target } from "./Target.js";

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
    if (!req.UserPoolId) throw new MissingParameterError("UserPoolId");
    if (!req.ProviderName) throw new MissingParameterError("ProviderName");

    const userPool = await cognito.getUserPool(ctx, req.UserPoolId);
    const identityProvider = await userPool.getIdentityProviderByProviderName(
      ctx,
      req.ProviderName,
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
        updatedIdentityProvider,
      ),
    };
  };
