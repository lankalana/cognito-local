import {
  CreateGroupRequest,
  CreateGroupResponse,
} from "@aws-sdk/client-cognito-identity-provider";
import { Services } from "../services";
import { Group } from "../services/userPoolService";
import { groupToResponseObject } from "./responses";
import { Target } from "./Target";
import { MissingParameterError } from "../errors";

export type CreateGroupTarget = Target<CreateGroupRequest, CreateGroupResponse>;

type CreateGroupServices = Pick<Services, "clock" | "cognito">;

export const CreateGroup =
  ({ cognito, clock }: CreateGroupServices): CreateGroupTarget =>
  async (ctx, req) => {
    if (!req.UserPoolId) throw new MissingParameterError("UserPoolId");
    if (!req.GroupName) throw new MissingParameterError("GroupName");

    const userPool = await cognito.getUserPool(ctx, req.UserPoolId);

    const now = clock.get();
    const group: Group = {
      CreationDate: now,
      Description: req.Description,
      GroupName: req.GroupName,
      LastModifiedDate: now,
      Precedence: req.Precedence,
      RoleArn: req.RoleArn,
    };

    await userPool.saveGroup(ctx, group);

    return {
      Group: groupToResponseObject(req.UserPoolId)(group),
    };
  };
