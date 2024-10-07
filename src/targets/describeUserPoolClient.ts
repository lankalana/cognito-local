import {
  DescribeUserPoolClientRequest,
  DescribeUserPoolClientResponse,
} from "@aws-sdk/client-cognito-identity-provider";
import { MissingParameterError, ResourceNotFoundError } from "../errors.js";
import { Services } from "../services/index.js";
import { appClientToResponseObject } from "./responses.js";
import { Target } from "./Target.js";

export type DescribeUserPoolClientTarget = Target<
  DescribeUserPoolClientRequest,
  DescribeUserPoolClientResponse
>;

export const DescribeUserPoolClient =
  ({ cognito }: Pick<Services, "cognito">): DescribeUserPoolClientTarget =>
  async (ctx, req) => {
    if (!req.ClientId) throw new MissingParameterError("ClientId");

    const client = await cognito.getAppClient(ctx, req.ClientId);
    if (!client || client?.UserPoolId !== req.UserPoolId) {
      throw new ResourceNotFoundError();
    }

    return {
      UserPoolClient: appClientToResponseObject(client),
    };
  };
