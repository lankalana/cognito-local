import {
  ListUserPoolsRequest,
  ListUserPoolsResponse,
} from "@aws-sdk/client-cognito-identity-provider";
import { Services } from "../services";
import { userPoolToResponseObject } from "./responses";
import { Target } from "./Target";

export type ListUserPoolsTarget = Target<
  ListUserPoolsRequest,
  ListUserPoolsResponse
>;

type ListGroupServices = Pick<Services, "cognito">;

export const ListUserPools =
  ({ cognito }: ListGroupServices): ListUserPoolsTarget =>
  async (ctx) => {
    // TODO: NextToken support
    // TODO: MaxResults support

    const userPools = await cognito.listUserPools(ctx);

    return {
      UserPools: userPools.map(userPoolToResponseObject),
    };
  };
