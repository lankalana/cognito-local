import { Context } from "../context.js";
import { DataStore } from "./dataStore.js";

export interface DataStoreFactory {
  create(ctx: Context, id: string, defaults: object): Promise<DataStore>;
}
