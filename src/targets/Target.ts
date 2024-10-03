import { Context } from "../services/context";
import { Targets } from "./targets";

export type TargetName = keyof typeof Targets;

export type Target<Req extends object, Res extends object> = (
  ctx: Context,
  req: Req,
) => Promise<Res>;

export const isSupportedTarget = (name: string): name is TargetName =>
  Object.keys(Targets).includes(name);
