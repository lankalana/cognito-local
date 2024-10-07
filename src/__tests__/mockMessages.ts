import { Messages } from "../services/index.js";

export const newMockMessages = (): jest.Mocked<Messages> => ({
  deliver: jest.fn(),
});
