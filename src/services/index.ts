import type { Config } from "../server/config";
import type { Clock } from "./clock";
import type { CognitoService } from "./cognitoService";
import type { Messages } from "./messages";
import type { TokenGenerator } from "./tokenGenerator";
import type { Triggers } from "./triggers";

export { type Clock, DateClock } from "./clock";
export { type CognitoService, CognitoServiceImpl } from "./cognitoService";
export { type Lambda, LambdaService } from "./lambda";
export { type Messages, MessagesService } from "./messages";
export { type Triggers, TriggersService } from "./triggers";
export { type UserPoolService, UserPoolServiceImpl } from "./userPoolService";

export interface Services {
  clock: Clock;
  cognito: CognitoService;
  config: Config;
  messages: Messages;
  otp: () => string;
  tokenGenerator: TokenGenerator;
  triggers: Triggers;
}
