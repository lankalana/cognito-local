import {
  ListGroupsRequest,
  ListGroupsResponse,
} from "@aws-sdk/client-cognito-identity-provider";
import { Services } from "../services";
import { groupToResponseObject } from "./responses";
import { Target } from "./Target";
import { MissingParameterError } from "../errors";

export type ListGroupsTarget = Target<ListGroupsRequest, ListGroupsResponse>;

type ListGroupServices = Pick<Services, "cognito">;

export const ListGroups =
  ({ cognito }: ListGroupServices): ListGroupsTarget =>
  async (ctx, req) => {
    if (!req.UserPoolId) throw new MissingParameterError("UserPoolId");
    
    // TODO: Limit support
    // TODO: PaginationToken support

    const userPool = await cognito.getUserPool(ctx, req.UserPoolId);
    const groups = await userPool.listGroups(ctx);

    return {
      Groups: groups.map(groupToResponseObject(req.UserPoolId)),
    };
  };
