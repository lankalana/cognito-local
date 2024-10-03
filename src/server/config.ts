import { Context } from "../services/context";
import { DataStoreFactory } from "../services/dataStore/factory";
import { FunctionConfig } from "../services/lambda";
import { UserPool } from "../services/userPoolService";
import { TokenConfig } from "../services/tokenGenerator";
import mergeWith from "lodash.mergewith";
import { KMSConfig } from "../services/crypto";
import { KMSClientConfig } from "@aws-sdk/client-kms";
import { LambdaClientConfig } from "@aws-sdk/client-lambda";

export type UserPoolDefaults = Omit<
  UserPool,
  "Id" | "CreationDate" | "LastModifiedDate"
>;

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
      accessKeyId: "local",
      secretAccessKey: "local",
    },
    region: "local",
  },
  TriggerFunctions: {},
  UserPoolDefaults: {
    UsernameAttributes: ["email"],
  },
  TokenConfig: {
    // TODO: this needs to match the actual host/port we started the server on
    IssuerDomain: "http://localhost:9229",
  },
  KMSConfig: {
    credentials: {
      accessKeyId: "local",
      secretAccessKey: "local",
    },
    region: "local",
  },
};

export const loadConfig = async (
  ctx: Context,
  dataStoreFactory: DataStoreFactory,
): Promise<Config> => {
  ctx.logger.debug("loadConfig");
  const dataStore = await dataStoreFactory.create(ctx, "config", {});

  const config = await dataStore.getRoot<Config>(ctx);

  return mergeWith(
    {},
    DefaultConfig,
    config ?? {},
    function customizer(objValue, srcValue) {
      if (Array.isArray(srcValue)) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return srcValue;
      }
    },
  );
};
