import "dotenv/config";

import { Agent, run, tool } from "@openai/agents";
import { aisdk } from "@openai/agents-extensions/ai-sdk";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import "dotenv/config";

process.env.GOOGLE_GENERATIVE_AI_API_KEY ??= process.env.GEMINI_API_KEY;

type UserContext = {
  userId: string;
  name: string;
  membership: "free" | "premium";
};
const getUserMembership = tool({
  name: "get_user_membership",

  description: "Get the current user's membership information.",

  parameters: z.object({}),

  execute: async (_, context) => {
    console.log("🔧 TOOL CALLED");

    console.log("👤 Context:", context);

    return context.context.membership;
  },
});
const model = aisdk(
  google("gemini-3.6-flash")
);

const agent = new Agent({
  name: "Context Agent",

  instructions: `
    You are a helpful assistant.

    When the user asks about their membership,
    use the get_user_membership tool.
  `,

  model,

  tools: [getUserMembership],
});

const getUserProfile = tool({
  name: "get_user_profile",

  description: "Get the current user's profile information.",

  parameters: z.object({}),

  execute: async (_, context) => {
    console.log("🔧 TOOL CALLED");
    console.log("👤 Context:", context);

    const profile = {
      name: context.context.name,
      membership: context.context.membership,
    };

    console.log("📦 TOOL RESULT:", profile);

    return profile;
  },
});

const userContext: UserContext = {
  userId: "user_123",
  name: "Abdul",
  membership: "premium",
};
async function main() {
  const result = await run(
    agent,
    "Tell me about my profile.",
    {
      context: userContext,
    }
  );

  console.log(result.finalOutput);
}

main().catch(console.error);