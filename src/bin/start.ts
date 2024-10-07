#!/usr/bin/env node

import { createDefaultServer } from "../server/index.js";
import { pino } from "pino";
import PinoPretty from "pino-pretty";
import process from "node:process";

const logger = pino(
  {
    level: process.env.DEBUG ? "debug" : "info",
  },
  PinoPretty({
    colorize: true,
    ignore: "pid,name,hostname",
    singleLine: true,
    messageFormat: (log, messageKey) =>
      `${(log["reqId"] as string) ?? "NONE"} ${(log["target"] as string) ?? "NONE"} ${log[messageKey] as string}`,
  }),
);

createDefaultServer(logger)
  .then((server) => {
    const hostname = process.env.HOST ?? "localhost";
    const port = parseInt(process.env.PORT ?? "9229", 10);
    return server.start({ hostname, port });
  })
  .then((httpServer) => {
    const address = httpServer.address();
    if (!address) {
      throw new Error("Server started without address");
    }
    const url =
      typeof address === "string"
        ? address
        : `${address.address}:${address.port}`;

    logger.info(`Cognito Local running on http://${url}`);
  })
  .catch((err) => {
    logger.error(err);
    process.exit(1);
  });

process.on("SIGTERM", () => process.exit(0));
process.on("SIGINT", () => process.exit(0));
