import {
  ListUserPoolClientsRequest,
  ListUserPoolClientsResponse,
} from "@aws-sdk/client-cognito-identity-provider";
import { Services } from "../services";
import { appClientToResponseListObject } from "./responses";
import { Target } from "./Target";
import { MissingParameterError } from "../errors";

export type ListUserPoolClientsTarget = Target<
  ListUserPoolClientsRequest,
  ListUserPoolClientsResponse
>;

type ListGroupServices = Pick<Services, "cognito">;

export const ListUserPoolClients =
  ({ cognito }: ListGroupServices): ListUserPoolClientsTarget =>
  async (ctx, req) => {
    if (!req.UserPoolId) throw new MissingParameterError("UserPoolId");

    // TODO: NextToken support
    // TODO: MaxResults support

    const clients = await cognito.listAppClients(ctx, req.UserPoolId);

    return {
      UserPoolClients: clients.map(appClientToResponseListObject),
    };
  };
