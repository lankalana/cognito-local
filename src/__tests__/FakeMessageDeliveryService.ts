import { Context } from '../services/context.js';
import { DeliveryDetails, MessageDelivery } from '../services/messageDelivery/messageDelivery.js';
import { Message } from '../services/messages.js';
import { User } from '../services/userPoolService.js';

interface CollectedMessage {
  readonly deliveryDetails: DeliveryDetails;
  readonly message: Message;
}

export class FakeMessageDeliveryService implements MessageDelivery {
  private readonly messages: CollectedMessage[] = [];

  public get collectedMessages(): readonly CollectedMessage[] {
    return [...this.messages];
  }

  deliver(
    ctx: Context,
    user: User,
    deliveryDetails: DeliveryDetails,
    message: Message
  ): Promise<void> {
    this.messages.push({
      deliveryDetails,
      message,
    });
    return Promise.resolve();
  }
}
