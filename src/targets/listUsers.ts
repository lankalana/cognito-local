import type {
  ListUsersRequest,
  ListUsersResponse,
} from "@aws-sdk/client-cognito-identity-provider";
import { InvalidParameterError, MissingParameterError } from "../errors";
import type { Services } from "../services";
import { userToResponseObject } from "./responses";
import type { Target } from "./Target";

export type ListUsersTarget = Target<ListUsersRequest, ListUsersResponse>;

const MaxLimit = 60;

// The token is a cursor (last returned username) bound to the pool and filter it was issued for, so
// users added or deleted between pages are neither skipped nor duplicated.
interface PaginationToken {
  UserPoolId: string;
  Filter: string;
  Username: string;
}

const encodeToken = (token: PaginationToken) =>
  Buffer.from(JSON.stringify(token)).toString("base64url");

const decodeToken = (encoded: string, req: ListUsersRequest): string => {
  let token: Partial<PaginationToken> | null;
  try {
    token = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
  } catch {
    token = null;
  }
  if (
    !token ||
    token.UserPoolId !== req.UserPoolId ||
    token.Filter !== (req.Filter ?? "") ||
    typeof token.Username !== "string"
  ) {
    throw new InvalidParameterError("Invalid pagination token");
  }
  return token.Username;
};

export const ListUsers =
  ({ cognito }: Pick<Services, "cognito">): ListUsersTarget =>
  async (ctx, req) => {
    if (!req.UserPoolId) throw new MissingParameterError("UserPoolId");

    // ponytail: AWS allows Limit 0 but doesn't document it, treat it like an absent Limit
    const limit = req.Limit || MaxLimit;
    if (!Number.isInteger(limit) || limit < 0 || limit > MaxLimit) {
      throw new InvalidParameterError(`Limit must be between 0 and ${MaxLimit}`);
    }
    const after = req.PaginationToken ? decodeToken(req.PaginationToken, req) : undefined;

    const userPool = await cognito.getUserPool(ctx, req.UserPoolId);
    const users = (await userPool.listUsers(ctx, req.Filter))
      .filter((user) => after === undefined || user.Username > after)
      .toSorted((a, b) => (a.Username < b.Username ? -1 : a.Username > b.Username ? 1 : 0));
    const page = users.slice(0, limit);

    // TODO: support AttributesToGet

    return {
      Users: page.map(userToResponseObject),
      PaginationToken:
        users.length > limit
          ? encodeToken({
              UserPoolId: req.UserPoolId,
              Filter: req.Filter ?? "",
              Username: page[page.length - 1].Username,
            })
          : undefined,
    };
  };
