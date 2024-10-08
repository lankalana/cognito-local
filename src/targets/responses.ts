import {
  GroupType,
  IdentityProviderType,
  UserPoolClientDescription,
  UserPoolClientType,
  UserPoolType,
  UserType,
} from '@aws-sdk/client-cognito-identity-provider';

import { AppClient } from '../services/appClient.js';
import { Group, User, UserPool } from '../services/userPoolService.js';
import { IdentityProvider } from '../services/userPoolService.js';

export const appClientToResponseListObject = (appClient: AppClient): UserPoolClientDescription => ({
  ClientId: appClient.ClientId,
  ClientName: appClient.ClientName,
  UserPoolId: appClient.UserPoolId,
});

export const appClientToResponseObject = (appClient: AppClient): UserPoolClientType => ({
  AccessTokenValidity: appClient.AccessTokenValidity,
  AllowedOAuthFlows: appClient.AllowedOAuthFlows,
  AllowedOAuthFlowsUserPoolClient: appClient.AllowedOAuthFlowsUserPoolClient,
  AllowedOAuthScopes: appClient.AllowedOAuthScopes,
  AnalyticsConfiguration: appClient.AnalyticsConfiguration,
  CallbackURLs: appClient.CallbackURLs,
  ClientId: appClient.ClientId,
  ClientName: appClient.ClientName,
  ClientSecret: appClient.ClientSecret,
  CreationDate: appClient.CreationDate,
  DefaultRedirectURI: appClient.DefaultRedirectURI,
  EnableTokenRevocation: appClient.EnableTokenRevocation,
  ExplicitAuthFlows: appClient.ExplicitAuthFlows,
  IdTokenValidity: appClient.IdTokenValidity,
  LastModifiedDate: appClient.LastModifiedDate,
  LogoutURLs: appClient.LogoutURLs,
  PreventUserExistenceErrors: appClient.PreventUserExistenceErrors,
  ReadAttributes: appClient.ReadAttributes,
  RefreshTokenValidity: appClient.RefreshTokenValidity,
  SupportedIdentityProviders: appClient.SupportedIdentityProviders,
  TokenValidityUnits: appClient.TokenValidityUnits,
  UserPoolId: appClient.UserPoolId,
  WriteAttributes: appClient.WriteAttributes,
});

export const userToResponseObject = (user: User): UserType => ({
  Attributes: user.Attributes,
  Enabled: user.Enabled,
  MFAOptions: user.MFAOptions,
  UserCreateDate: user.UserCreateDate,
  UserLastModifiedDate: user.UserLastModifiedDate,
  Username: user.Username,
  UserStatus: user.UserStatus,
});

export const groupToResponseObject =
  (userPoolId: string) =>
  (group: Group): GroupType => ({
    CreationDate: group.CreationDate,
    Description: group.Description,
    GroupName: group.GroupName,
    LastModifiedDate: group.LastModifiedDate,
    Precedence: group.Precedence,
    RoleArn: group.RoleArn,
    UserPoolId: userPoolId,
  });

export const identityProviderToResponseObject =
  (userPoolId: string) =>
  (identityProvider: IdentityProvider): IdentityProviderType => ({
    UserPoolId: userPoolId,
    ProviderName: identityProvider.ProviderName,
    ProviderType: identityProvider.ProviderType,
    ProviderDetails: identityProvider.ProviderDetails,
    AttributeMapping: identityProvider.AttributeMapping,
    IdpIdentifiers: identityProvider.IdpIdentifiers,
    LastModifiedDate: identityProvider.LastModifiedDate,
    CreationDate: identityProvider.CreationDate,
  });

export const userPoolToResponseObject = (userPool: UserPool): UserPoolType => ({
  AccountRecoverySetting: userPool.AccountRecoverySetting,
  AdminCreateUserConfig: userPool.AdminCreateUserConfig,
  AliasAttributes: userPool.AliasAttributes,
  Arn: userPool.Arn,
  AutoVerifiedAttributes: userPool.AutoVerifiedAttributes,
  CreationDate: userPool.CreationDate,
  CustomDomain: userPool.CustomDomain,
  DeviceConfiguration: userPool.DeviceConfiguration,
  Domain: userPool.Domain,
  EmailConfiguration: userPool.EmailConfiguration,
  EmailConfigurationFailure: userPool.EmailConfigurationFailure,
  EmailVerificationMessage: userPool.EmailVerificationMessage,
  EmailVerificationSubject: userPool.EmailVerificationSubject,
  EstimatedNumberOfUsers: userPool.EstimatedNumberOfUsers,
  Id: userPool.Id,
  LambdaConfig: userPool.LambdaConfig,
  LastModifiedDate: userPool.LastModifiedDate,
  MfaConfiguration: userPool.MfaConfiguration,
  Name: userPool.Name,
  Policies: userPool.Policies,
  SchemaAttributes: userPool.SchemaAttributes,
  SmsAuthenticationMessage: userPool.SmsAuthenticationMessage,
  SmsConfiguration: userPool.SmsConfiguration,
  SmsConfigurationFailure: userPool.SmsConfigurationFailure,
  SmsVerificationMessage: userPool.SmsVerificationMessage,
  Status: userPool.Status,
  UsernameAttributes: userPool.UsernameAttributes,
  UsernameConfiguration: userPool.UsernameConfiguration,
  UserPoolAddOns: userPool.UserPoolAddOns,
  UserPoolTags: userPool.UserPoolTags,
  VerificationMessageTemplate: userPool.VerificationMessageTemplate,
});
