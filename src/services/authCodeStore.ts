import * as uuid from "uuid";

export interface AuthCodeRecord {
  clientId: string;
  username: string;
  // userPoolId is optional when server cannot access services directly
  userPoolId?: string;
  redirectUri?: string;
  scope?: string;
  // when available store tokens returned by authentication step
  tokens?: {
    AccessToken?: string;
    IdToken?: string;
    RefreshToken?: string;
  };
  expiresAt: number;
}

export class AuthCodeStore {
  private readonly codes = new Map<string, AuthCodeRecord>();
  private readonly ttlMs = 60 * 1000; // 60s

  public create(payload: Omit<AuthCodeRecord, "expiresAt">): string {
    const code = uuid.v4();
    const rec: AuthCodeRecord = {
      ...payload,
      expiresAt: Date.now() + this.ttlMs,
    };
    this.codes.set(code, rec);
    return code;
  }

  public consume(code: string): AuthCodeRecord | null {
    const rec = this.codes.get(code);
    if (!rec) return null;
    if (rec.expiresAt < Date.now()) {
      this.codes.delete(code);
      return null;
    }
    this.codes.delete(code);
    return rec;
  }
}
