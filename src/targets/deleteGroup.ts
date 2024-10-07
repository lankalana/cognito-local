import { DeleteGroupRequest } from "@aws-sdk/client-cognito-identity-provider";
import { GroupNotFoundError, MissingParameterError } from "../errors.js";
import { Services } from "../services/index.js";
import { Target } from "./Target.js";

export type DeleteGroupTarget = Target<DeleteGroupRequest, object>;

type DeleteGroupServices = Pick<Services, "cognito">;

export const DeleteGroup =
  ({ cognito }: DeleteGroupServices): DeleteGroupTarget =>
  async (ctx, req) => {
    if (!req.UserPoolId) throw new MissingParameterError("UserPoolId");
    if (!req.GroupName) throw new MissingParameterError("GroupName");

    // TODO: from the docs "Calling this action requires developer credentials.", can we enforce this?

    const userPool = await cognito.getUserPool(ctx, req.UserPoolId);
    const group = await userPool.getGroupByGroupName(ctx, req.GroupName);
    if (!group) {
      throw new GroupNotFoundError();
    }

    await userPool.deleteGroup(ctx, group);

    return {};
  };
