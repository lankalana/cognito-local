import { Lambda } from "../services/index.js";

export const newMockLambda = (): jest.Mocked<Lambda> => ({
  enabled: jest.fn(),
  invoke: jest.fn(),
});
