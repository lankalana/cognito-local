import type {
  GetSigningCertificateRequest,
  GetSigningCertificateResponse,
} from "@aws-sdk/client-cognito-identity-provider";
import { MissingParameterError } from "../errors";
import SigningCertificate from "../keys/cognitoLocal.signingCertificate.json";
import type { Services } from "../services";
import type { Target } from "./Target";

export type GetSigningCertificateTarget = Target<
  GetSigningCertificateRequest,
  GetSigningCertificateResponse
>;

// ponytail: one static self-signed certificate for every pool, cognito-local never signs SAML requests
export const GetSigningCertificate =
  ({ cognito }: Pick<Services, "cognito">): GetSigningCertificateTarget =>
  async (ctx, req) => {
    if (!req.UserPoolId) throw new MissingParameterError("UserPoolId");

    await cognito.getUserPool(ctx, req.UserPoolId);

    return { Certificate: SigningCertificate.certificate };
  };
