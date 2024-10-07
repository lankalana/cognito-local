import { AddCustomAttributes } from "./addCustomAttributes.js";
import { AdminAddUserToGroup } from "./adminAddUserToGroup.js";
import { AdminConfirmSignUp } from "./adminConfirmSignUp.js";
import { AdminCreateUser } from "./adminCreateUser.js";
import { AdminDeleteUser } from "./adminDeleteUser.js";

import { AdminDeleteUserAttributes } from "./adminDeleteUserAttributes.js";
import { AdminDisableUser } from "./adminDisableUser.js";
import { AdminEnableUser } from "./adminEnableUser.js";
import { AdminGetUser } from "./adminGetUser.js";
import { AdminInitiateAuth } from "./adminInitiateAuth.js";
import { AdminLinkProviderForUser } from "./adminLinkProviderForUser.js";
import { AdminListGroupsForUser } from "./adminListGroupsForUser.js";
import { AdminRemoveUserFromGroup } from "./adminRemoveUserFromGroup.js";
import { AdminSetUserPassword } from "./adminSetUserPassword.js";
import { AdminUpdateUserAttributes } from "./adminUpdateUserAttributes.js";
import { ChangePassword } from "./changePassword.js";
import { ConfirmForgotPassword } from "./confirmForgotPassword.js";
import { ConfirmSignUp } from "./confirmSignUp.js";
import { CreateGroup } from "./createGroup.js";
import { CreateIdentityProvider } from "./createIdentityProvider.js";
import { CreateUserPool } from "./createUserPool.js";
import { CreateUserPoolClient } from "./createUserPoolClient.js";
import { DeleteGroup } from "./deleteGroup.js";
import { DeleteIdentityProvider } from "./deleteIdentityProvider.js";
import { DeleteUser } from "./deleteUser.js";
import { DeleteUserAttributes } from "./deleteUserAttributes.js";
import { DeleteUserPool } from "./deleteUserPool.js";
import { DeleteUserPoolClient } from "./deleteUserPoolClient.js";
import { DescribeIdentityProvider } from "./describeIdentityProvider.js";
import { DescribeUserPool } from "./describeUserPool.js";
import { DescribeUserPoolClient } from "./describeUserPoolClient.js";
import { ForgotPassword } from "./forgotPassword.js";
import { GetGroup } from "./getGroup.js";
import { GetIdentityProviderByIdentifier } from "./getIdentityProviderByIdentifier.js";
import { GetUser } from "./getUser.js";
import { GetUserAttributeVerificationCode } from "./getUserAttributeVerificationCode.js";
import { GetUserPoolMfaConfig } from "./getUserPoolMfaConfig.js";
import { InitiateAuth } from "./initiateAuth.js";
import { ListGroups } from "./listGroups.js";
import { ListIdentityProviders } from "./listIdentityProviders.js";
import { ListUserPoolClients } from "./listUserPoolClients.js";
import { ListUserPools } from "./listUserPools.js";
import { ListUsers } from "./listUsers.js";
import { ListUsersInGroup } from "./listUsersInGroup.js";
import { RespondToAuthChallenge } from "./respondToAuthChallenge.js";
import { RevokeToken } from "./revokeToken.js";
import { SignUp } from "./signUp.js";
import { UpdateGroup } from "./updateGroup.js";
import { UpdateIdentityProvider } from "./updateIdentityProvider.js";
import { UpdateUserAttributes } from "./updateUserAttributes.js";
import { UpdateUserPool } from "./updateUserPool.js";
import { UpdateUserPoolClient } from "./updateUserPoolClient.js";
import { VerifyUserAttribute } from "./verifyUserAttribute.js";

export const Targets = {
  AddCustomAttributes,
  AdminAddUserToGroup,
  AdminConfirmSignUp,
  AdminCreateUser,
  AdminDeleteUser,
  AdminDeleteUserAttributes,
  AdminDisableUser,
  AdminEnableUser,
  AdminGetUser,
  AdminInitiateAuth,
  AdminLinkProviderForUser,
  AdminListGroupsForUser,
  AdminRemoveUserFromGroup,
  AdminSetUserPassword,
  AdminUpdateUserAttributes,
  ChangePassword,
  ConfirmForgotPassword,
  ConfirmSignUp,
  CreateGroup,
  CreateIdentityProvider,
  CreateUserPool,
  CreateUserPoolClient,
  DeleteGroup,
  DeleteIdentityProvider,
  DeleteUser,
  DeleteUserAttributes,
  DeleteUserPool,
  DeleteUserPoolClient,
  DescribeIdentityProvider,
  DescribeUserPool,
  DescribeUserPoolClient,
  ForgotPassword,
  GetGroup,
  GetIdentityProviderByIdentifier,
  GetUser,
  GetUserAttributeVerificationCode,
  GetUserPoolMfaConfig,
  InitiateAuth,
  ListGroups,
  ListIdentityProviders,
  ListUserPoolClients,
  ListUserPools,
  ListUsers,
  ListUsersInGroup,
  RespondToAuthChallenge,
  RevokeToken,
  SignUp,
  UpdateGroup,
  UpdateIdentityProvider,
  UpdateUserAttributes,
  UpdateUserPool,
  UpdateUserPoolClient,
  VerifyUserAttribute,
} as const;
