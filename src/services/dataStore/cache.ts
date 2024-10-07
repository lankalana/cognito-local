import { DataStore } from "./dataStore.js";

export type DataStoreCache = {
  get(key: string): DataStore | null;
  set(key: string, value: DataStore): void;
};

export class InMemoryCache implements DataStoreCache {
  private readonly cache: Record<string, DataStore> = {};

  get(key: string): DataStore | null {
    return this.cache[key];
  }

  set(key: string, value: DataStore): void {
    this.cache[key] = value;
  }
}

export class NoOpCache implements DataStoreCache {
  get(): DataStore | null {
    return null;
  }

  set(): void {}
}
