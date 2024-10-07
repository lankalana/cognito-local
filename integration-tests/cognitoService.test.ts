import { TestContext } from "../src/__tests__/testContext.js";
import { DateClock } from "../src/services/index.js";
import {
  CognitoServiceFactory,
  CognitoServiceFactoryImpl,
  USER_POOL_AWS_DEFAULTS,
} from "../src/services/cognitoService.js";
import { mkdtemp, rmdir } from "fs/promises";
import { NoOpCache } from "../src/services/dataStore/cache.js";
import { StormDBDataStoreFactory } from "../src/services/dataStore/stormDb.js";
import { UserPoolServiceFactoryImpl } from "../src/services/userPoolService.js";
import { existsSync } from "fs";

describe("Cognito Service", () => {
  let dataDirectory: string;
  let factory: CognitoServiceFactory;

  beforeEach(async () => {
    dataDirectory = await mkdtemp("/tmp/cognito-local:");

    const clock = new DateClock();
    const dataStoreFactory = new StormDBDataStoreFactory(
      dataDirectory,
      new NoOpCache(),
    );

    factory = new CognitoServiceFactoryImpl(
      dataDirectory,
      clock,
      dataStoreFactory,
      new UserPoolServiceFactoryImpl(clock, dataStoreFactory),
    );
  });

  afterEach(() =>
    rmdir(dataDirectory, {
      recursive: true,
    }),
  );

  describe("CognitoServiceFactory", () => {
    it("creates a clients database", async () => {
      await factory.create(TestContext, {});

      expect(existsSync(`${dataDirectory}/clients.json`)).toBe(true);
    });
  });

  it("creates a user pool database", async () => {
    const cognitoService = await factory.create(TestContext, {});

    await cognitoService.getUserPool(TestContext, "test-pool");

    expect(existsSync(`${dataDirectory}/test-pool.json`)).toBe(true);
  });

  it("lists multiple user pools", async () => {
    const cognitoService = await factory.create(TestContext, {});

    await cognitoService.getUserPool(TestContext, "test-pool-1");
    await cognitoService.getUserPool(TestContext, "test-pool-2");
    await cognitoService.getUserPool(TestContext, "test-pool-3");

    expect(existsSync(`${dataDirectory}/test-pool-1.json`)).toBe(true);
    expect(existsSync(`${dataDirectory}/test-pool-2.json`)).toBe(true);
    expect(existsSync(`${dataDirectory}/test-pool-3.json`)).toBe(true);

    const pools = await cognitoService.listUserPools(TestContext);
    expect(pools).toEqual([
      { ...USER_POOL_AWS_DEFAULTS, Id: "test-pool-1" },
      { ...USER_POOL_AWS_DEFAULTS, Id: "test-pool-2" },
      { ...USER_POOL_AWS_DEFAULTS, Id: "test-pool-3" },
    ]);
  });

  it("deletes user pools", async () => {
    const cognitoService = await factory.create(TestContext, {});

    const up1 = await cognitoService.getUserPool(TestContext, "test-pool-1");
    const up2 = await cognitoService.getUserPool(TestContext, "test-pool-2");

    expect(existsSync(`${dataDirectory}/test-pool-1.json`)).toBe(true);
    expect(existsSync(`${dataDirectory}/test-pool-2.json`)).toBe(true);

    await cognitoService.deleteUserPool(TestContext, up1.options);

    expect(existsSync(`${dataDirectory}/test-pool-1.json`)).not.toBe(true);

    await cognitoService.deleteUserPool(TestContext, up2.options);

    expect(existsSync(`${dataDirectory}/test-pool-2.json`)).not.toBe(true);
  });
});
