import type {
  DescribeUserPoolRequest,
  DescribeUserPoolResponse,
} from "aws-sdk/clients/cognitoidentityserviceprovider";
import { ResourceNotFoundError } from "../errors";
import { MissingParameterError, ResourceNotFoundError } from "../errors.js";
import type { Services } from "../services";
import type { Services } from "../services/index.js";
import { userPoolToResponseObject } from "./responses";
import { userPoolToResponseObject } from "./responses.js";
import type { Target } from "./Target";
import type { Target } from "./Target.js";

export type DescribeUserPoolTarget = Target<
  DescribeUserPoolRequest,
  DescribeUserPoolResponse
>;

export const DescribeUserPool =
  ({ cognito }: Pick<Services, "cognito">): DescribeUserPoolTarget =>
  async (ctx, req) => {
    if (!req.UserPoolId) throw new MissingParameterError("UserPoolId");

    const userPool = await cognito.getUserPool(ctx, req.UserPoolId);
    if (!userPool) {
      throw new ResourceNotFoundError();
    }

    return {
      UserPool: userPoolToResponseObject(userPool.options),
    };
  };
