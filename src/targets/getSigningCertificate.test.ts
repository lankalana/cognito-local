import { X509Certificate } from "node:crypto";
import { beforeEach, describe, expect, it, type MockedObject } from "vitest";
import { newMockCognitoService } from "../__tests__/mockCognitoService";
import { newMockUserPoolService } from "../__tests__/mockUserPoolService";
import { TestContext } from "../__tests__/testContext";
import { ResourceNotFoundError } from "../errors";
import type { CognitoService } from "../services";
import { GetSigningCertificate, type GetSigningCertificateTarget } from "./getSigningCertificate";

describe("GetSigningCertificate target", () => {
  let getSigningCertificate: GetSigningCertificateTarget;
  let mockCognitoService: MockedObject<CognitoService>;

  beforeEach(() => {
    mockCognitoService = newMockCognitoService(newMockUserPoolService());
    getSigningCertificate = GetSigningCertificate({ cognito: mockCognitoService });
  });

  it("returns a base64 DER encoded X.509 certificate", async () => {
    const output = await getSigningCertificate(TestContext, { UserPoolId: "test" });

    expect(mockCognitoService.getUserPool).toHaveBeenCalledWith(TestContext, "test");
    const certificate = new X509Certificate(Buffer.from(output.Certificate!, "base64"));
    expect(certificate.subject).toEqual("CN=cognito-local");
  });

  it("throws if the user pool doesn't exist", async () => {
    mockCognitoService.getUserPool.mockRejectedValue(new ResourceNotFoundError());

    await expect(getSigningCertificate(TestContext, { UserPoolId: "missing" })).rejects.toEqual(
      new ResourceNotFoundError(),
    );
  });
});
