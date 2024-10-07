import { KMSClientConfig } from '@aws-sdk/client-kms';
import { LambdaClientConfig } from '@aws-sdk/client-lambda';
import mergeWith from 'lodash.mergewith';

import { Context } from '../services/context.js';
import { KMSConfig } from '../services/crypto.js';
import { DataStoreFactory } from '../services/dataStore/factory.js';
import { FunctionConfig } from '../services/lambda.js';
import { TokenConfig } from '../services/tokenGenerator.js';
import { UserPool } from '../services/userPoolService.js';

export type UserPoolDefaults = Omit<UserPool, 'Id' | 'CreationDate' | 'LastModifiedDate'>;

export interface Config {
  LambdaClient: LambdaClientConfig;
  TriggerFunctions: FunctionConfig;
  UserPoolDefaults: UserPoolDefaults;
  KMSConfig?: KMSClientConfig & KMSConfig;
  TokenConfig: TokenConfig;
}

export const DefaultConfig: Config = {
  LambdaClient: {
    credentials: {
      accessKeyId: 'local',
      secretAccessKey: 'local',
    },
    region: 'local',
  },
  TriggerFunctions: {},
  UserPoolDefaults: {
    UsernameAttributes: ['email'],
  },
  TokenConfig: {
    // TODO: this needs to match the actual host/port we started the server on
    IssuerDomain: 'http://localhost:9229',
  },
  KMSConfig: {
    credentials: {
      accessKeyId: 'local',
      secretAccessKey: 'local',
    },
    region: 'local',
  },
};

export const loadConfig = async (
  ctx: Context,
  dataStoreFactory: DataStoreFactory
): Promise<Config> => {
  ctx.logger.debug('loadConfig');
  const dataStore = await dataStoreFactory.create(ctx, 'config', {});

  const config = await dataStore.getRoot<Config>(ctx);

  return mergeWith({}, DefaultConfig, config ?? {}, function customizer(objValue, srcValue) {
    if (Array.isArray(srcValue)) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return srcValue;
    }
  });
};
