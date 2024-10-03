import { AttributeType } from "@aws-sdk/client-cognito-identity-provider";
import * as uuid from "uuid";
import { NotAuthorizedError, ResourceNotFoundError } from "../../errors";
import { Clock } from "../clock";
import { CognitoService } from "../cognitoService";
import { UserMigrationTriggerResponse, Lambda } from "../lambda";
import {
  attributesFromRecord,
  attributesToRecord,
  User,
} from "../userPoolService";
import { Trigger } from "./trigger";

export type UserMigrationTrigger = Trigger<
  {
    userPoolId: string;
    clientId: string;
    username: string;
    password: string;
    userAttributes: AttributeType[];

    /**
     * One or more key-value pairs that you can provide as custom input to the Lambda function that you specify for the
     * migrate user trigger. You can pass this data to your Lambda function by using the ClientMetadata parameter in the
     * AdminRespondToAuthChallenge and ForgotPassword API actions.
     *
     * Source: https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-lambda-migrate-user.html#cognito-user-pools-lambda-trigger-syntax-user-migration
     */
    clientMetadata: Record<string, string> | undefined;

    /**
     * One or more key-value pairs containing the validation data in the user's sign-in request. You can pass this data to
     * your Lambda function by using the ClientMetadata parameter in the InitiateAuth and AdminInitiateAuth API actions.
     *
     * Source: https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-lambda-migrate-user.html#cognito-user-pools-lambda-trigger-syntax-user-migration
     */
    validationData: Record<string, string> | undefined;
  },
  User
>;

interface UserMigrationServices {
  clock: Clock;
  cognitoClient: CognitoService;
  lambda: Lambda;
}

export const UserMigration =
  ({
    lambda,
    cognitoClient,
    clock,
  }: UserMigrationServices): UserMigrationTrigger =>
  async (
    ctx,
    {
      clientId,
      clientMetadata,
      password,
      userAttributes,
      username,
      userPoolId,
      validationData,
    }
  ) => {
    const userPool = await cognitoClient.getUserPoolForClientId(ctx, clientId);
    if (!userPool) {
      throw new ResourceNotFoundError();
    }

    let result: UserMigrationTriggerResponse;

    try {
      result = await lambda.invoke(ctx, "UserMigration", {
        clientId,
        clientMetadata,
        password,
        triggerSource: "UserMigration_Authentication",
        userAttributes: attributesToRecord(userAttributes),
        username,
        userPoolId,
        validationData,
      });
    } catch {
      throw new NotAuthorizedError();
    }

    const now = clock.get();
    const user: User = {
      Attributes: attributesFromRecord(result.userAttributes ?? {}),
      Enabled: true,
      Password: password,
      UserCreateDate: now,
      UserLastModifiedDate: now,
      Username: result.userAttributes?.username || uuid.v4(),
      UserStatus: result.finalUserStatus ?? "CONFIRMED",
      RefreshTokens: [],
    };

    if (result.forceAliasCreation) {
      // TODO: do something with aliases?
    }

    await userPool.saveUser(ctx, user);

    if (result.messageAction !== "SUPPRESS") {
      // TODO: send notification when not suppressed?
    }

    return user;
  };
