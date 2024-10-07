import { Context } from "../context.js";
import { Message } from "../messages.js";
import { User } from "../userPoolService.js";

export interface MessageSender {
  sendEmail(
    ctx: Context,
    user: User,
    destination: string,
    message: Message,
  ): Promise<void>;
  sendSms(
    ctx: Context,
    user: User,
    destination: string,
    message: Message,
  ): Promise<void>;
}
