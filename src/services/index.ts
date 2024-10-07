import { Config } from '../server/config.js';
import { Clock } from './clock.js';
import { CognitoService } from './cognitoService.js';
import { Messages } from './messages.js';
import { TokenGenerator } from './tokenGenerator.js';
import { Triggers } from './triggers/index.js';

export type { Clock } from './clock.js';
export { DateClock } from './clock.js';
export type { CognitoService } from './cognitoService.js';
export { CognitoServiceImpl } from './cognitoService.js';
export type { Lambda } from './lambda.js';
export { LambdaService } from './lambda.js';
export type { Messages } from './messages.js';
export { MessagesService } from './messages.js';
export type { Triggers } from './triggers/index.js';
export { TriggersService } from './triggers/index.js';
export type { UserPoolService } from './userPoolService.js';
export { UserPoolServiceImpl } from './userPoolService.js';

export interface Services {
  clock: Clock;
  cognito: CognitoService;
  config: Config;
  messages: Messages;
  otp: () => string;
  tokenGenerator: TokenGenerator;
  triggers: Triggers;
}
