import { Context } from "../context.js";
import { Message } from "../messages.js";
import { User } from "../userPoolService.js";
import { MessageSender } from "./messageSender.js";

export type DeliveryDetails =
  | {
      AttributeName: "email";
      DeliveryMedium: "EMAIL";
      Destination: string;
    }
  | {
      AttributeName: "phone_number";
      DeliveryMedium: "SMS";
      Destination: string;
    };

export interface MessageDelivery {
  deliver(
    ctx: Context,
    user: User,
    deliveryDetails: DeliveryDetails,
    message: Message,
  ): Promise<void>;
}

export class MessageDeliveryService implements MessageDelivery {
  private readonly sender: MessageSender;

  public constructor(sender: MessageSender) {
    this.sender = sender;
  }

  public async deliver(
    ctx: Context,
    user: User,
    deliveryDetails: DeliveryDetails,
    message: Message,
  ): Promise<void> {
    if (deliveryDetails.DeliveryMedium === "SMS") {
      await this.sender.sendSms(
        ctx,
        user,
        deliveryDetails.Destination,
        message,
      );
    } else if (deliveryDetails.DeliveryMedium === "EMAIL") {
      await this.sender.sendEmail(
        ctx,
        user,
        deliveryDetails.Destination,
        message,
      );
    }
  }
}
