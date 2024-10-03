import {
  RevokeTokenRequest,
  RevokeTokenResponse,
} from "@aws-sdk/client-cognito-identity-provider";
import { MissingParameterError, NotAuthorizedError } from "../errors";
import { Services } from "../services";
import { Target } from "./Target";

export type RevokeTokenTarget = Target<RevokeTokenRequest, RevokeTokenResponse>;

type RevokeTokenServices = Pick<Services, "cognito">;

export const RevokeToken =
  ({ cognito }: RevokeTokenServices): RevokeTokenTarget =>
  async (ctx, req) => {
    if (!req.ClientId) throw new MissingParameterError("ClientId");
    if (!req.Token) throw new MissingParameterError("Token");

    const userPool = await cognito.getUserPoolForClientId(ctx, req.ClientId);

    const users = await userPool.listUsers(ctx);
    const user = users.find(
      (user) =>
        Array.isArray(user.RefreshTokens) &&
        user.RefreshTokens.includes(req.Token!),
    );

    if (!user) {
      throw new NotAuthorizedError();
    }

    const tokens = Array.isArray(user.RefreshTokens) ? user.RefreshTokens : [];
    const tokenIndex = tokens.indexOf(req.Token);

    if (tokenIndex !== -1) {
      tokens.splice(tokenIndex, 1);
    }

    await userPool.saveUser(ctx, {
      ...user,
      RefreshTokens: [...tokens],
    });

    return {};
  };
