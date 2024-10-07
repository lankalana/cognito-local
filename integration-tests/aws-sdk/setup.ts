import { CognitoIdentityProvider } from '@aws-sdk/client-cognito-identity-provider';
import { mkdtemp, rmdir } from 'fs/promises';
import http from 'http';
import { type Logger, pino } from 'pino';
import { sink } from 'pino-test';

import { FakeMessageDeliveryService } from '../../src/__tests__/FakeMessageDeliveryService.js';
import { createServer } from '../../src/index.js';
import { DefaultConfig } from '../../src/server/config.js';
import { Router } from '../../src/server/Router.js';
import { CognitoServiceFactoryImpl } from '../../src/services/cognitoService.js';
import { CryptoService } from '../../src/services/crypto.js';
import { NoOpCache } from '../../src/services/dataStore/cache.js';
import { DataStoreFactory } from '../../src/services/dataStore/factory.js';
import { StormDBDataStoreFactory } from '../../src/services/dataStore/stormDb.js';
import { Clock, DateClock, MessagesService, TriggersService } from '../../src/services/index.js';
import { otp } from '../../src/services/otp.js';
import { JwtTokenGenerator } from '../../src/services/tokenGenerator.js';
import { UserPoolServiceFactoryImpl } from '../../src/services/userPoolService.js';

export const withCognitoSdk =
  (
    fn: (
      cognito: () => CognitoIdentityProvider,
      services: {
        readonly dataStoreFactory: () => DataStoreFactory;
        readonly messageDelivery: () => FakeMessageDeliveryService;
      }
    ) => void,
    {
      logger = pino(sink()) as Logger,
      clock = new DateClock(),
    }: { logger?: Logger; clock?: Clock } = {}
  ) =>
  () => {
    let dataDirectory: string;
    let httpServer: http.Server;
    let cognitoSdk: CognitoIdentityProvider;
    let dataStoreFactory: DataStoreFactory;
    let fakeMessageDeliveryService: FakeMessageDeliveryService;

    beforeEach(async () => {
      dataDirectory = await mkdtemp('/tmp/cognito-local:');
      const ctx = { logger };

      dataStoreFactory = new StormDBDataStoreFactory(dataDirectory, new NoOpCache());
      const cognitoServiceFactory = new CognitoServiceFactoryImpl(
        dataDirectory,
        clock,
        dataStoreFactory,
        new UserPoolServiceFactoryImpl(clock, dataStoreFactory)
      );
      const cognitoClient = await cognitoServiceFactory.create(ctx, {});
      const triggers = new TriggersService(
        clock,
        cognitoClient,
        {
          enabled: jest.fn().mockReturnValue(false),
          invoke: jest.fn(),
        },
        new CryptoService({ KMSKeyId: '', KMSKeyAlias: '' })
      );

      fakeMessageDeliveryService = new FakeMessageDeliveryService();
      const router = Router({
        clock,
        cognito: cognitoClient,
        config: DefaultConfig,
        messages: new MessagesService(triggers, fakeMessageDeliveryService),
        otp,
        triggers,
        tokenGenerator: new JwtTokenGenerator(clock, triggers, DefaultConfig.TokenConfig),
      });
      const server = createServer(router, ctx.logger);
      httpServer = await server.start({
        hostname: '127.0.0.1',
        port: 0,
      });

      const address = httpServer.address();
      if (!address) {
        throw new Error('HttpServer has no address');
      }
      const url = typeof address === 'string' ? address : `${address.address}:${address.port}`;

      cognitoSdk = new CognitoIdentityProvider({
        credentials: {
          accessKeyId: 'local',
          secretAccessKey: 'local',
        },
        region: 'local',
        endpoint: `http://${url}`,
      });
    });

    fn(() => cognitoSdk, {
      dataStoreFactory: () => dataStoreFactory,
      messageDelivery: () => fakeMessageDeliveryService,
    });

    afterEach((done) => {
      httpServer.close(() => {
        rmdir(dataDirectory, {
          recursive: true,
        }).then(done, done);
      });
    });
  };
