#!/usr/bin/env node

import * as https from "node:https";
import Pino, { pino } from "pino";
import PinoPretty from "pino-pretty";
import PinoPretty from "pino-pretty";
import { createDefaultServer } from "../server";

import { createDefaultServer } from "../server/index.js";

const logger = pino(
  {
    level: process.env.DEBUG ? "debug" : "info",
  },
  PinoPretty({
    colorize: true,
    ignore: "pid,name,hostname",
    singleLine: true,
    messageFormat: (log, messageKey) =>
      `${log.reqId ?? "NONE"} ${log.target ?? "NONE"} ${log[messageKey]}`,
  }),
);

createDefaultServer(logger)
  .then((server) => server.start())
  .then((server) => {
    const address = server.address();
    if (!address) {
      throw new Error("Server started without address");
    }
    const url =
      typeof address === "string"
        ? address
        : `${address.address}:${address.port}`;

    const proto = server instanceof https.Server ? "https" : "http";

    logger.info(`Cognito Local running on ${proto}://${url}`);
  })
  .catch((err) => {
    logger.error(err);
    process.exit(1);
  });

process.on("SIGTERM", () => process.exit(0));
process.on("SIGINT", () => process.exit(0));
