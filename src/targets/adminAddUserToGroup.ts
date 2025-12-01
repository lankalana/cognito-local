import type { AdminAddUserToGroupRequest } from "aws-sdk/clients/cognitoidentityserviceprovider";
import { GroupNotFoundError, UserNotFoundError } from "../errors";
import type { Services } from "../services";
import type { Target } from "./Target";

export type AdminAddUserToGroupTarget = Target<
  AdminAddUserToGroupRequest,
  object
>;

export type AdminAddUserToGroupTarget = Target<AdminAddUserToGroupRequest, object>;

type AdminAddUserToGroupServices = Pick<Services, 'cognito'>;

export const AdminAddUserToGroup =
  ({ cognito }: AdminAddUserToGroupServices): AdminAddUserToGroupTarget =>
  async (ctx, req) => {
    if (!req.UserPoolId) throw new MissingParameterError('UserPoolId');
    if (!req.GroupName) throw new MissingParameterError('GroupName');
    if (!req.Username) throw new MissingParameterError('Username');

    const userPool = await cognito.getUserPool(ctx, req.UserPoolId);

    const group = await userPool.getGroupByGroupName(ctx, req.GroupName);
    if (!group) {
      throw new GroupNotFoundError();
    }

    const user = await userPool.getUserByUsername(ctx, req.Username);
    if (!user) {
      throw new UserNotFoundError();
    }

    await userPool.addUserToGroup(ctx, group, user);

    return {};
  };
