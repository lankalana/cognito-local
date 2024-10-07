import { otp } from "./otp.js";

describe("otp", () => {
  it("generates a code", () => {
    expect(otp()).toMatch(/^[0-9]{6}$/);
  });
});
