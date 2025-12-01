import type {
  ChangePasswordRequest,
  ChangePasswordResponse,
} from "aws-sdk/clients/cognitoidentityserviceprovider";
import jwt from "jsonwebtoken";
import {
  InvalidParameterError,
  InvalidPasswordError,
  MissingParameterError,
  NotAuthorizedError,
} from "../errors";
import type { Services } from "../services";
import type { Token } from "../services/tokenGenerator";
import type { Target } from "./Target";

export type ChangePasswordTarget = Target<ChangePasswordRequest, ChangePasswordResponse>;

type ChangePasswordServices = Pick<Services, 'cognito' | 'clock'>;

export const ChangePassword =
  ({ cognito, clock }: ChangePasswordServices): ChangePasswordTarget =>
  async (ctx, req) => {
    if (!req.AccessToken) throw new MissingParameterError('AccessToken');
    if (!req.ProposedPassword) throw new MissingParameterError('ProposedPassword');

    const decodedToken = jwt.decode(req.AccessToken) as Token | null;
    if (!decodedToken) {
      ctx.logger.info('Unable to decode token');
      throw new InvalidParameterError();
    }

    const userPool = await cognito.getUserPoolForClientId(
      ctx,
      decodedToken.client_id,
    );
    const user = await userPool.getUserByUsername(ctx, decodedToken.username);
    if (!user) {
      throw new NotAuthorizedError();
    }

    if (req.PreviousPassword !== user.Password) {
      throw new InvalidPasswordError();
    }

    await userPool.saveUser(ctx, {
      ...user,
      Password: req.ProposedPassword,
      UserLastModifiedDate: clock.get(),
    });

    return {};
  };
