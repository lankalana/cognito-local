import {
  CreateIdentityProviderRequest,
  CreateIdentityProviderResponse,
} from "@aws-sdk/client-cognito-identity-provider";
import { Services } from "../services";
import { IdentityProvider } from "../services/userPoolService";
import { identityProviderToResponseObject } from "./responses";
import { Target } from "./Target";
import { MissingParameterError } from "../errors";

export type CreateIdentityProviderTarget = Target<
  CreateIdentityProviderRequest,
  CreateIdentityProviderResponse
>;

type CreateIdentityProviderServices = Pick<Services, "clock" | "cognito">;

export const CreateIdentityProvider =
  ({
    cognito,
    clock,
  }: CreateIdentityProviderServices): CreateIdentityProviderTarget =>
  async (ctx, req) => {
    if (!req.UserPoolId) throw new MissingParameterError("UserPoolId");
    if (!req.ProviderName) throw new MissingParameterError("ProviderName");
    
    const userPool = await cognito.getUserPool(ctx, req.UserPoolId);

    const now = clock.get();
    const identityProvider: IdentityProvider = {
      UserPoolId: req.UserPoolId,
      ProviderName: req.ProviderName,
      ProviderType: req.ProviderType,
      ProviderDetails: req.ProviderDetails,
      AttributeMapping: req.AttributeMapping,
      IdpIdentifiers: req.IdpIdentifiers,
      LastModifiedDate: now,
      CreationDate: now,
    };

    await userPool.saveIdentityProvider(ctx, identityProvider);

    return {
      IdentityProvider: identityProviderToResponseObject(req.UserPoolId)(
        identityProvider
      ),
    };
  };
