import {
  AdminListGroupsForUserRequest,
  AdminListGroupsForUserResponse,
} from "@aws-sdk/client-cognito-identity-provider";
import { MissingParameterError, UserNotFoundError } from "../errors.js";
import { Services } from "../services/index.js";
import { groupToResponseObject } from "./responses.js";
import { Target } from "./Target.js";

export type AdminListGroupsForUserTarget = Target<
  AdminListGroupsForUserRequest,
  AdminListGroupsForUserResponse
>;

type AdminListGroupsForUserServices = Pick<Services, "cognito">;

export const AdminListGroupsForUser =
  ({ cognito }: AdminListGroupsForUserServices): AdminListGroupsForUserTarget =>
  async (ctx, req) => {
    if (!req.UserPoolId) throw new MissingParameterError("UserPoolId");
    if (!req.Username) throw new MissingParameterError("Username");

    const userPool = await cognito.getUserPool(ctx, req.UserPoolId);
    const user = await userPool.getUserByUsername(ctx, req.Username);
    if (!user) {
      throw new UserNotFoundError();
    }

    const groups = await userPool.listGroups(ctx);
    const usersGroups = groups.filter((x) =>
      x.members?.includes(req.Username!),
    );

    return {
      Groups: usersGroups.map(groupToResponseObject(req.UserPoolId)),
    };
  };
