import { Services } from "../services/index.js";
import { UnsupportedError } from "../errors.js";
import { isSupportedTarget } from "../targets/Target.js";
import { Targets } from "../targets/targets.js";
import { Context } from "../services/context.js";

// eslint-disable-next-line
export type Route = (ctx: Context, req: any) => Promise<unknown>;
export type Router = (target: string) => Route;

export const Router =
  (services: Services): Router =>
  (target: string) => {
    if (!isSupportedTarget(target)) {
      return () =>
        Promise.reject(
          new UnsupportedError(`Unsupported x-amz-target header "${target}"`),
        );
    }

    const t = Targets[target](services);

    return async (ctx, req) => {
      const targetLogger = ctx.logger.child({
        target,
      });

      targetLogger.debug("start");
      const res = await t(
        {
          ...ctx,
          logger: targetLogger,
        },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        req,
      );
      targetLogger.debug("end");
      return res;
    };
  };
