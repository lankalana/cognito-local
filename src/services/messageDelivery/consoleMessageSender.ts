import { Context } from "../context.js";
import { Message } from "../messages.js";
import { User } from "../userPoolService.js";
import { MessageSender } from "./messageSender.js";

export class ConsoleMessageSender implements MessageSender {
  public sendEmail(
    ctx: Context,
    user: User,
    destination: string,
    message: Message,
  ): Promise<void> {
    return this.sendToConsole(ctx, user, destination, message);
  }

  public sendSms(
    ctx: Context,
    user: User,
    destination: string,
    message: Message,
  ): Promise<void> {
    return this.sendToConsole(ctx, user, destination, message);
  }

  private sendToConsole(
    ctx: Context,
    user: User,
    destination: string,
    { __code, ...message }: Message,
  ): Promise<void> {
    const fields = {
      Username: user.Username,
      Destination: destination,
      Code: __code,
      "Email Subject": message.emailSubject,
      "Email Message": message.emailMessage,
      "SMS Message": message.smsMessage,
    };
    const definedFields = Object.entries(fields).filter(
      (kv): kv is [string, string] => !!kv[1],
    );

    const longestDefinedFieldName = Math.max(
      ...definedFields.map(([k]) => k.length),
    );
    const formattedFields = definedFields.map(
      ([k, v]) => `${(k + ":").padEnd(longestDefinedFieldName + 1)} ${v}`,
    );

    ctx.logger.info(
      `Confirmation Code Delivery\n\n${formattedFields.join("\n")}`,
    );

    return Promise.resolve();
  }
}
