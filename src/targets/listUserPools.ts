import type {
  ListUserPoolsRequest,
  ListUserPoolsResponse,
} from "aws-sdk/clients/cognitoidentityserviceprovider";
import type { Services } from "../services";
import type { Services } from "../services/index.js";
import { userPoolToResponseObject } from "./responses";
import { userPoolToResponseObject } from "./responses.js";
import type { Target } from "./Target";
import type { Target } from "./Target.js";

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
