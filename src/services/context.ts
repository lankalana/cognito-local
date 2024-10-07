import { LogService } from "./LogService.js";
export interface Context {
  readonly logger: LogService;
}
