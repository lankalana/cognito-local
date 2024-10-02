import { Context } from "../context";

export type Trigger<Params extends object, Res extends object | null | void> = (
  ctx: Context,
  params: Params
) => Promise<Res>;
