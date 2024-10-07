import {
  ListGroupsRequest,
  ListGroupsResponse,
} from "@aws-sdk/client-cognito-identity-provider";
import { Services } from "../services/index.js";
import { groupToResponseObject } from "./responses.js";
import { Target } from "./Target.js";
import { MissingParameterError } from "../errors.js";

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
