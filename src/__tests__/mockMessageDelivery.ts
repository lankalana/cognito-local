import { MessageDelivery } from '../services/messageDelivery/messageDelivery.js';

export const newMockMessageDelivery = (): jest.Mocked<MessageDelivery> => ({
  deliver: jest.fn(),
});
