import {
  UpdateGroupRequest,
  UpdateGroupResponse,
} from "@aws-sdk/client-cognito-identity-provider";
import { Services } from "../services";
import { GroupNotFoundError, MissingParameterError } from "../errors";
import { groupToResponseObject } from "./responses";
import { Target } from "./Target";

export type UpdateGroupTarget = Target<UpdateGroupRequest, UpdateGroupResponse>;

type UpdateGroupServices = Pick<Services, "clock" | "cognito">;

export const UpdateGroup =
  ({ clock, cognito }: UpdateGroupServices): UpdateGroupTarget =>
  async (ctx, req) => {
    if (!req.UserPoolId) throw new MissingParameterError("UserPoolId");
    if (!req.GroupName) throw new MissingParameterError("GroupName");
    
    const userPool = await cognito.getUserPool(ctx, req.UserPoolId);
    const group = await userPool.getGroupByGroupName(ctx, req.GroupName);
    if (!group) {
      throw new GroupNotFoundError();
    }

    const updatedGroup = {
      ...group,
      Description: req.Description ?? group.Description,
      Precedence: req.Precedence ?? group.Precedence,
      RoleArn: req.RoleArn ?? group.RoleArn,
      LastModifiedDate: clock.get(),
    };

    await userPool.saveGroup(ctx, updatedGroup);

    return {
      Group: groupToResponseObject(req.UserPoolId)(updatedGroup),
    };
  };
