import { AdminRemoveUserFromGroupRequest } from "@aws-sdk/client-cognito-identity-provider";
import { GroupNotFoundError, MissingParameterError, UserNotFoundError } from "../errors";
import { Services } from "../services";
import { Target } from "./Target";

export type AdminRemoveUserFromGroupTarget = Target<
  AdminRemoveUserFromGroupRequest,
  object
>;

type AdminRemoveUserFromGroupServices = Pick<Services, "cognito">;

export const AdminRemoveUserFromGroup =
  ({
    cognito,
  }: AdminRemoveUserFromGroupServices): AdminRemoveUserFromGroupTarget =>
  async (ctx, req) => {
    if (!req.UserPoolId) throw new MissingParameterError("UserPoolId");
    if (!req.GroupName) throw new MissingParameterError("GroupName");
    if (!req.Username) throw new MissingParameterError("Username");

    const userPool = await cognito.getUserPool(ctx, req.UserPoolId);

    const group = await userPool.getGroupByGroupName(ctx, req.GroupName);
    if (!group) {
      throw new GroupNotFoundError();
    }

    const user = await userPool.getUserByUsername(ctx, req.Username);
    if (!user) {
      throw new UserNotFoundError();
    }

    await userPool.removeUserFromGroup(ctx, group, user);

    return {};
  };
