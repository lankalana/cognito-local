import type { KMSClientConfig } from "@aws-sdk/client-kms";
import type { LambdaClientConfig } from "@aws-sdk/client-lambda";
import mergeWith from "lodash.mergewith";
import type { Context } from "../services/context.js";
import type { KMSConfig } from "../services/crypto.js";
import type { DataStoreFactory } from "../services/dataStore/factory.js";
import type { FunctionConfig } from "../services/lambda.js";
import type { TokenConfig } from "../services/tokenGenerator.js";
import type { UserPool } from "../services/userPoolService.js";
import type { ServerOptions } from "./server";

export type UserPoolDefaults = Omit<
  UserPool,
  "Id" | "CreationDate" | "LastModifiedDate"
>;

export interface Config {
  LambdaClient: LambdaClientConfig;
  TriggerFunctions: FunctionConfig;
  UserPoolDefaults: UserPoolDefaults;
  KMSConfig?: KMSClientConfig & KMSConfig;
  ServerConfig: ServerOptions;
  TokenConfig: TokenConfig;
}

const port = parseInt(process.env.PORT ?? "9229", 10);
const hostname = process.env.HOST ?? "localhost";

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
    IssuerDomain: `http://${hostname}:${port}`,
  },
  KMSConfig: {
    credentials: {
      accessKeyId: "local",
      secretAccessKey: "local",
    },
    region: "local",
  },
  ServerConfig: {
    port,
    hostname,
    development: !!process.env.COGNITO_LOCAL_DEVMODE,
    https: false,
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
    function customizer(_objValue, srcValue) {
      if (Array.isArray(srcValue)) {
        return srcValue;
      }
    },
  );
};
