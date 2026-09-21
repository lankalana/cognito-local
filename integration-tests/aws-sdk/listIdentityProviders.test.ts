import { describe, expect, it } from "vitest";
import { ClockFake } from "../../src/__tests__/clockFake.js";
import { withCognitoSdk } from "./setup.js";

const currentDate = new Date();
const roundedDate = new Date(currentDate.getTime());
roundedDate.setMilliseconds(0);

const clock = new ClockFake(currentDate);

describe(
  "CognitoIdentityServiceProvider.listIdentityProviders",
  withCognitoSdk(
    (Cognito) => {
      it("returns a list of identity providers", async () => {
        const client = Cognito();

        const pool1 = await client.createUserPool({ PoolName: "test 1" });
        const userPool1Id = pool1.UserPool!.Id!;
        const pool2 = await client.createUserPool({ PoolName: "test 2" });
        const userPool2Id = pool2.UserPool!.Id!;

        await client.createIdentityProvider({
          UserPoolId: userPool1Id,
          ProviderName: "Google",
          ProviderType: "Google",
          ProviderDetails: { client_id: "abc" },
          AttributeMapping: { email: "email" },
          IdpIdentifiers: ["google"],
        });
        await client.createIdentityProvider({
          UserPoolId: userPool1Id,
          ProviderName: "Facebook",
          ProviderType: "Facebook",
          ProviderDetails: { client_id: "def" },
        });
        await client.createIdentityProvider({
          UserPoolId: userPool2Id,
          ProviderName: "LoginWithAmazon",
          ProviderType: "LoginWithAmazon",
          ProviderDetails: { client_id: "ghi" },
        });

        const result1 = await client.listIdentityProviders({
          UserPoolId: userPool1Id,
        });

        // the API only returns a summary of each provider, not the full object
        expect(result1.Providers).toEqual([
          {
            CreationDate: roundedDate,
            LastModifiedDate: roundedDate,
            ProviderName: "Google",
            ProviderType: "Google",
          },
          {
            CreationDate: roundedDate,
            LastModifiedDate: roundedDate,
            ProviderName: "Facebook",
            ProviderType: "Facebook",
          },
        ]);

        const result2 = await client.listIdentityProviders({
          UserPoolId: userPool2Id,
        });

        expect(result2.Providers).toEqual([
          {
            CreationDate: roundedDate,
            LastModifiedDate: roundedDate,
            ProviderName: "LoginWithAmazon",
            ProviderType: "LoginWithAmazon",
          },
        ]);
      });

      it("returns an empty collection when there are no identity providers", async () => {
        const client = Cognito();

        const pool = await client.createUserPool({ PoolName: "test" });

        const result = await client.listIdentityProviders({
          UserPoolId: pool.UserPool!.Id!,
        });

        expect(result.Providers).toEqual([]);
      });
    },
    {
      clock,
    },
  ),
);
