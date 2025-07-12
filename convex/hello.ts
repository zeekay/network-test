import { query } from "./_generated/server";

export const getHello = query({
  args: {},
  handler: async () => {
    return "hello!";
  },
});