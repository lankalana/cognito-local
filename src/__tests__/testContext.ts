import { Context } from '../services/context.js';
import { MockLogger } from './mockLogger.js';

export const TestContext: Context = {
  logger: MockLogger,
};
