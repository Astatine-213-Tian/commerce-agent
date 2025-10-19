/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as category_mutations from "../category/mutations.js";
import type * as category_queries from "../category/queries.js";
import type * as lib_openai from "../lib/openai.js";
import type * as product_actions from "../product/actions.js";
import type * as product_mutations from "../product/mutations.js";
import type * as product_queries from "../product/queries.js";
import type * as seed_mockdata from "../seed/mockdata.js";
import type * as seed_seed from "../seed/seed.js";
import type * as storage_mutations from "../storage/mutations.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "category/mutations": typeof category_mutations;
  "category/queries": typeof category_queries;
  "lib/openai": typeof lib_openai;
  "product/actions": typeof product_actions;
  "product/mutations": typeof product_mutations;
  "product/queries": typeof product_queries;
  "seed/mockdata": typeof seed_mockdata;
  "seed/seed": typeof seed_seed;
  "storage/mutations": typeof storage_mutations;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {};
