import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";
import { api } from "./_generated/api";
import { generateArrayOfArraysWithSize } from "./makeLarge";

export const simpleQuery = query({
  args: {
    count: v.number(),
    resultSizeInBytes: v.optional(v.number()),
    cacheBust: v.optional(v.number()),
  },

  handler: async (ctx, args) => {
    // Always read numbers for the result set;
    const numbers = await ctx.db
      .query("numbers")
      .order("desc")
      .take(args.count);
    const resultSizeInBytes = args.resultSizeInBytes || 100;
    const largePayload = generateArrayOfArraysWithSize(resultSizeInBytes);
    return {
      largePayload,
      viewer: (await ctx.auth.getUserIdentity())?.name ?? null,
      numbers: numbers.reverse().map((number) => number.value),
    };
  },
});

export const addNumber = mutation({
  args: {
    value: v.number(),
  },

  handler: async (ctx, args) => {
    const id = await ctx.db.insert("numbers", { value: args.value });

    console.log("Added new document with id:", id);
  },
});

export const myAction = action({
  args: {
    first: v.number(),
    second: v.string(),
  },

  handler: async (ctx, args) => {
    const data = await ctx.runQuery(api.myFunctions.simpleQuery, {
      count: 10,
    });
    console.log(data);

    await ctx.runMutation(api.myFunctions.addNumber, {
      value: args.first,
    });
  },
});
