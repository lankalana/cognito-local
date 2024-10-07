import { Context } from '../services/context.js';
import { Targets } from './targets.js';

export type TargetName = keyof typeof Targets;

export type Target<Req extends object, Res extends object> = (
  ctx: Context,
  req: Req
) => Promise<Res>;

export const isSupportedTarget = (name: string): name is TargetName =>
  Object.keys(Targets).includes(name);
