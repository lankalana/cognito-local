import fs from "node:fs";
import type http from "node:http";
import net from "node:net";
import { promisify } from "node:util";
import { CognitoIdentityProvider } from "@aws-sdk/client-cognito-identity-provider";
import { type Logger, pino } from "pino";
import { afterEach, beforeEach, it, vi } from "vitest";
import { createServer } from "../../src";
import { FakeMessageDeliveryService } from "../../src/__tests__/FakeMessageDeliveryService";
import { DefaultConfig } from "../../src/server/config";
import { Router } from "../../src/server/Router";
import {
  type Clock,
  DateClock,
  MessagesService,
  TriggersService,
} from "../../src/services";
import { CognitoServiceFactoryImpl } from "../../src/services/cognitoService";
import { CryptoService } from "../../src/services/crypto";
import type { DataStoreFactory } from "../../src/services/dataStore/factory";
import { StormDBDataStoreFactory } from "../../src/services/dataStore/stormDb";
import { otp } from "../../src/services/otp";
import { JwtTokenGenerator } from "../../src/services/tokenGenerator";
import { UserPoolServiceFactoryImpl } from "../../src/services/userPoolService";

const mkdtemp = promisify(fs.mkdtemp);
const rm = promisify(fs.rm);

const sink = () => ({ write: () => {} });

const detectListenSupport = async () => {
  if (process.env.COGNITO_LOCAL_SKIP_NETWORK === "1") {
    return false;
  }

  return new Promise<boolean>((resolve) => {
    const server = net.createServer();
    server.once("error", () => resolve(false));
    server.listen(0, "127.0.0.1", () => {
      server.close(() => resolve(true));
    });
  });
};

const canListen = await detectListenSupport();

export const withCognitoSdk =
  (
    fn: (
      cognito: () => CognitoIdentityProvider,
      services: {
        readonly dataStoreFactory: () => DataStoreFactory;
        readonly messageDelivery: () => FakeMessageDeliveryService;
        readonly baseUrl: () => string;
      },
    ) => void,
    {
      logger = pino(sink()) as Logger,
      clock = new DateClock(),
    }: { logger?: Logger; clock?: Clock } = {},
  ) =>
  () => {
    if (!canListen) {
      it.skip("requires network access to bind a local HTTP server", () => {});
      return;
    }

    let dataDirectory: string;
    let httpServer: http.Server;
    let cognitoSdk: CognitoIdentityProvider;
    let dataStoreFactory: DataStoreFactory;
    let fakeMessageDeliveryService: FakeMessageDeliveryService;
    let url: string;

    beforeEach(async () => {
      dataDirectory = await mkdtemp("/tmp/cognito-local:");
      const ctx = { logger };

      dataStoreFactory = new StormDBDataStoreFactory(dataDirectory);
      const cognitoServiceFactory = new CognitoServiceFactoryImpl(
        dataDirectory,
        dataStoreFactory,
        new UserPoolServiceFactoryImpl(clock, dataStoreFactory),
      );
      const cognitoClient = await cognitoServiceFactory.create(ctx, {});
      const triggers = new TriggersService(
        clock,
        cognitoClient,
        {
          enabled: vi.fn().mockReturnValue(false),
          invoke: vi.fn(),
        },
        new CryptoService({ KMSKeyId: "", KMSKeyAlias: "" }),
      );

      fakeMessageDeliveryService = new FakeMessageDeliveryService();

      const messages = new MessagesService(
        triggers,
        fakeMessageDeliveryService,
      );
      const tokenGenerator = new JwtTokenGenerator(
        clock,
        triggers,
        DefaultConfig.TokenConfig,
      );

      const services = {
        clock,
        cognito: cognitoClient,
        config: DefaultConfig,
        messages,
        otp,
        tokenGenerator,
        triggers,
      } as const;

      const router = Router(services);
      const server = createServer(router, ctx.logger, {
        development: false,
        hostname: "127.0.0.1",
        https: false,
        port: 0,
      });
      httpServer = await server.start();

      const address = httpServer.address();
      if (!address) {
        throw new Error("HttpServer has no address");
      }
      url =
        typeof address === "string"
          ? address
          : `${address.address}:${address.port}`;

      cognitoSdk = new CognitoIdentityProvider({
        credentials: {
          accessKeyId: "local",
          secretAccessKey: "local",
        },
        region: "local",
        endpoint: `http://${url}`,
      });
    });

    fn(() => cognitoSdk, {
      dataStoreFactory: () => dataStoreFactory,
      messageDelivery: () => fakeMessageDeliveryService,
      baseUrl: () => `http://${url}`,
    });

    afterEach(() => {
      return new Promise<void>((resolve, reject) => {
        httpServer.close(() => {
          rm(dataDirectory, {
            recursive: true,
          }).then(resolve, reject);
        });
      });
    });
  };
