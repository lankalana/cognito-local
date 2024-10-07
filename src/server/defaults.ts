import { Lambda } from '@aws-sdk/client-lambda';
import pino from 'pino';

import { CognitoServiceFactoryImpl } from '../services/cognitoService.js';
import { CryptoService } from '../services/crypto.js';
import { InMemoryCache } from '../services/dataStore/cache.js';
import { StormDBDataStoreFactory } from '../services/dataStore/stormDb.js';
import { DateClock, LambdaService, MessagesService, TriggersService } from '../services/index.js';
import { ConsoleMessageSender } from '../services/messageDelivery/consoleMessageSender.js';
import { MessageDeliveryService } from '../services/messageDelivery/messageDelivery.js';
import { otp } from '../services/otp.js';
import { JwtTokenGenerator } from '../services/tokenGenerator.js';
import { UserPoolServiceFactoryImpl } from '../services/userPoolService.js';
import { loadConfig } from './config.js';
import { Router } from './Router.js';
import { createServer, Server } from './server.js';

export const createDefaultServer = async (logger: pino.Logger): Promise<Server> => {
  const configDirectory = '.cognito';
  const dataDirectory = `${configDirectory}/db`;
  const ctx = {
    logger,
  };

  const config = await loadConfig(
    ctx,
    // the config gets a separate factory because it's stored in a different directory
    new StormDBDataStoreFactory(configDirectory, new InMemoryCache())
  );

  logger.debug({ config }, 'Loaded config');

  const clock = new DateClock();

  const dataStoreFactory = new StormDBDataStoreFactory(dataDirectory, new InMemoryCache());

  const cognitoServiceFactory = new CognitoServiceFactoryImpl(
    dataDirectory,
    clock,
    dataStoreFactory,
    new UserPoolServiceFactoryImpl(clock, dataStoreFactory)
  );
  const cognitoClient = await cognitoServiceFactory.create(ctx, config.UserPoolDefaults);
  const triggers = new TriggersService(
    clock,
    cognitoClient,
    new LambdaService(config.TriggerFunctions, new Lambda(config.LambdaClient)),
    new CryptoService(config.KMSConfig)
  );

  return createServer(
    Router({
      clock,
      cognito: cognitoClient,
      config,
      messages: new MessagesService(
        triggers,
        new MessageDeliveryService(new ConsoleMessageSender())
      ),
      otp,
      tokenGenerator: new JwtTokenGenerator(clock, triggers, config.TokenConfig),
      triggers,
    }),
    logger,
    {
      development: !!process.env.COGNITO_LOCAL_DEVMODE,
    }
  );
};
