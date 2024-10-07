import { TokenGenerator } from "../services/tokenGenerator.js";

export const newMockTokenGenerator = (): jest.Mocked<TokenGenerator> => ({
  generate: jest.fn(),
});
