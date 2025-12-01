import type { Config } from "../server/config";
import type { Clock } from "./clock";
import type { CognitoService } from "./cognitoService";
import type { Messages } from "./messages";
import type { TokenGenerator } from "./tokenGenerator";
import type { Triggers } from "./triggers";

export { DateClock, type Clock } from "./clock";
export { CognitoServiceImpl, type CognitoService } from "./cognitoService";
export { LambdaService, type Lambda } from "./lambda";
export { MessagesService, type Messages } from "./messages";
export { TriggersService, type Triggers } from "./triggers";
export { UserPoolServiceImpl, type UserPoolService } from "./userPoolService";

export interface Services {
  clock: Clock;
  cognito: CognitoService;
  config: Config;
  messages: Messages;
  otp: () => string;
  tokenGenerator: TokenGenerator;
  triggers: Triggers;
}
