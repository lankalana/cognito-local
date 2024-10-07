import { Clock } from "../clock.js";
import { CognitoService } from "../cognitoService.js";
import { CryptoService } from "../crypto.js";
import { Lambda } from "../lambda.js";
import {
  CustomEmailSender,
  CustomEmailSenderTrigger,
} from "./customEmailSender.js";
import { CustomMessage, CustomMessageTrigger } from "./customMessage.js";
import {
  PostAuthentication,
  PostAuthenticationTrigger,
} from "./postAuthentication.js";
import {
  PostConfirmation,
  PostConfirmationTrigger,
} from "./postConfirmation.js";
import { PreSignUp, PreSignUpTrigger } from "./preSignUp.js";
import {
  PreTokenGeneration,
  PreTokenGenerationTrigger,
} from "./preTokenGeneration.js";
import { UserMigration, UserMigrationTrigger } from "./userMigration.js";

type SupportedTriggers =
  | "CustomEmailSender"
  | "CustomMessage"
  | "UserMigration"
  | "PostAuthentication"
  | "PostConfirmation"
  | "PreSignUp"
  | "PreTokenGeneration";

export interface Triggers {
  enabled(trigger: SupportedTriggers): boolean;
  customMessage: CustomMessageTrigger;
  customEmailSender: CustomEmailSenderTrigger;
  postAuthentication: PostAuthenticationTrigger;
  postConfirmation: PostConfirmationTrigger;
  preSignUp: PreSignUpTrigger;
  preTokenGeneration: PreTokenGenerationTrigger;
  userMigration: UserMigrationTrigger;
}

export class TriggersService implements Triggers {
  private readonly lambda: Lambda;

  public readonly customMessage: CustomMessageTrigger;
  public readonly customEmailSender: CustomEmailSenderTrigger;
  public readonly postAuthentication: PostAuthenticationTrigger;
  public readonly postConfirmation: PostConfirmationTrigger;
  public readonly preSignUp: PreSignUpTrigger;
  public readonly preTokenGeneration: PreTokenGenerationTrigger;
  public readonly userMigration: UserMigrationTrigger;

  public constructor(
    clock: Clock,
    cognitoClient: CognitoService,
    lambda: Lambda,
    crypto: CryptoService,
  ) {
    this.lambda = lambda;

    this.customEmailSender = CustomEmailSender({ lambda, crypto });
    this.customMessage = CustomMessage({ lambda });
    this.postAuthentication = PostAuthentication({ lambda });
    this.postConfirmation = PostConfirmation({ lambda });
    this.preSignUp = PreSignUp({ lambda });
    this.preTokenGeneration = PreTokenGeneration({ lambda });
    this.userMigration = UserMigration({ clock, lambda, cognitoClient });
  }

  public enabled(trigger: SupportedTriggers): boolean {
    return this.lambda.enabled(trigger);
  }
}
