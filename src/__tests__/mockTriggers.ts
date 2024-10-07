import { Triggers } from '../services/index.js';

export const newMockTriggers = (): jest.Mocked<Triggers> => ({
  customMessage: jest.fn(),
  customEmailSender: jest.fn(),
  enabled: jest.fn(),
  postAuthentication: jest.fn(),
  postConfirmation: jest.fn(),
  preSignUp: jest.fn(),
  preTokenGeneration: jest.fn(),
  userMigration: jest.fn(),
});
