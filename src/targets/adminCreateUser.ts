import {
  AdminCreateUserRequest,
  AdminCreateUserResponse,
  DeliveryMediumType,
} from '@aws-sdk/client-cognito-identity-provider';
import shortUUID from 'short-uuid';
import * as uuid from 'uuid';

import {
  InvalidParameterError,
  MissingParameterError,
  UnsupportedError,
  UsernameExistsError,
} from '../errors.js';
import { Context } from '../services/context.js';
import { Messages, Services, UserPoolService } from '../services/index.js';
import { DeliveryDetails } from '../services/messageDelivery/messageDelivery.js';
import { attributesInclude, attributeValue, User } from '../services/userPoolService.js';
import { userToResponseObject } from './responses.js';
import { Target } from './Target.js';

const generator = shortUUID('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!');

export type AdminCreateUserTarget = Target<AdminCreateUserRequest, AdminCreateUserResponse>;

type AdminCreateUserServices = Pick<Services, 'clock' | 'cognito' | 'messages' | 'config'>;

const selectAppropriateDeliveryMethod = (
  desiredDeliveryMediums: DeliveryMediumType[],
  user: User
): DeliveryDetails | null => {
  if (desiredDeliveryMediums.includes('SMS')) {
    const phoneNumber = attributeValue('phone_number', user.Attributes);
    if (phoneNumber) {
      return {
        AttributeName: 'phone_number',
        DeliveryMedium: 'SMS',
        Destination: phoneNumber,
      };
    }
  }

  if (desiredDeliveryMediums.includes('EMAIL')) {
    const email = attributeValue('email', user.Attributes);
    if (email) {
      return {
        AttributeName: 'email',
        DeliveryMedium: 'EMAIL',
        Destination: email,
      };
    }
  }

  return null;
};

const deliverWelcomeMessage = async (
  ctx: Context,
  req: AdminCreateUserRequest,
  temporaryPassword: string,
  user: User,
  messages: Messages,
  userPool: UserPoolService
) => {
  const deliveryDetails = selectAppropriateDeliveryMethod(
    req.DesiredDeliveryMediums ?? ['SMS'],
    user
  );
  if (!deliveryDetails) {
    // TODO: I don't know what the real error message should be for this
    throw new InvalidParameterError('User has no attribute matching desired delivery mediums');
  }

  await messages.deliver(
    ctx,
    'AdminCreateUser',
    null,
    userPool.options.Id,
    user,
    temporaryPassword,
    req.ClientMetadata,
    deliveryDetails
  );
};

export const AdminCreateUser =
  ({ clock, cognito, messages, config }: AdminCreateUserServices): AdminCreateUserTarget =>
  async (ctx, req) => {
    if (!req.UserPoolId) throw new MissingParameterError('UserPoolId');
    if (!req.Username) throw new MissingParameterError('Username');

    const userPool = await cognito.getUserPool(ctx, req.UserPoolId);
    const existingUser = await userPool.getUserByUsername(ctx, req.Username);
    const supressWelcomeMessage = req.MessageAction === 'SUPPRESS';

    if (existingUser && req.MessageAction === 'RESEND') {
      throw new UnsupportedError('AdminCreateUser with MessageAction=RESEND');
    } else if (existingUser) {
      throw new UsernameExistsError();
    }

    const attributes = attributesInclude('sub', req.UserAttributes)
      ? (req.UserAttributes ?? [])
      : [{ Name: 'sub', Value: uuid.v4() }, ...(req.UserAttributes ?? [])];

    const now = clock.get();

    const temporaryPassword =
      req.TemporaryPassword ?? process.env.CODE ?? generator.new().slice(0, 6);

    const isEmailUsername = config.UserPoolDefaults.UsernameAttributes?.includes('email');
    const hasEmailAttribute = attributesInclude('email', attributes);

    if (isEmailUsername && !hasEmailAttribute) {
      attributes.push({ Name: 'email', Value: req.Username });
    }

    const user: User = {
      Username: req.Username,
      Password: temporaryPassword,
      Attributes: attributes,
      Enabled: true,
      UserStatus: 'FORCE_CHANGE_PASSWORD',
      ConfirmationCode: undefined,
      UserCreateDate: now,
      UserLastModifiedDate: now,
      RefreshTokens: [],
    };
    await userPool.saveUser(ctx, user);

    // TODO: should throw InvalidParameterException when a non-email is supplied as the Username when the pool has email as a UsernameAttribute
    // TODO: support MessageAction=="RESEND"
    // TODO: should generate a TemporaryPassword if one isn't set
    // TODO: support ForceAliasCreation
    // TODO: support PreSignIn lambda and ValidationData

    if (!supressWelcomeMessage) {
      await deliverWelcomeMessage(ctx, req, temporaryPassword, user, messages, userPool);
    }

    return {
      User: userToResponseObject(user),
    };
  };
