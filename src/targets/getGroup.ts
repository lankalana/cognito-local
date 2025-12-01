import type {
  GetGroupRequest,
  GetGroupResponse,
} from "aws-sdk/clients/cognitoidentityserviceprovider";
import { GroupNotFoundError } from "../errors";
import type { Services } from "../services";
import { groupToResponseObject } from "./responses";
import type { Target } from "./Target";

export type GetGroupTarget = Target<GetGroupRequest, GetGroupResponse>;

export const GetGroup =
  ({ cognito }: Pick<Services, 'cognito'>): GetGroupTarget =>
  async (ctx, req) => {
    if (!req.UserPoolId) throw new MissingParameterError('UserPoolId');
    if (!req.GroupName) throw new MissingParameterError('GroupName');

    const userPool = await cognito.getUserPool(ctx, req.UserPoolId);
    const group = await userPool.getGroupByGroupName(ctx, req.GroupName);
    if (!group) {
      throw new GroupNotFoundError();
    }

    return {
      Group: groupToResponseObject(req.UserPoolId)(group),
    };
  };
