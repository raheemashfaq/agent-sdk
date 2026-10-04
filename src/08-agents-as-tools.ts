import "dotenv/config";

import { Agent, run } from "@openai/agents";
import { aisdk } from "@openai/agents-extensions/ai-sdk";
import { google } from "@ai-sdk/google";
process.env.GOOGLE_GENERATIVE_AI_API_KEY ??= process.env.GEMINI_API_KEY;

const model = aisdk(
  google("gemini-3.6-flash")
);

// --------------------------------
// Specialist Agent
// --------------------------------

const mathAgent = new Agent({
  name: "Math Agent",

  instructions: `
    You are a math specialist.

    First say:
    "🔢 Math Agent started."

    Solve the mathematical problem accurately.

    Before finishing, say:
    "🔢 Math Agent finished."

    Return a concise explanation.
  `,

  model,
});

// --------------------------------
// Main Agent
// --------------------------------

const mainAgent = new Agent({
  name: "Main Agent",

  instructions: `
    You are a helpful general assistant.

    You can delegate mathematical problems
    to the Math Agent.

    When you delegate a task, continue using
    the Math Agent's result to answer the user.

    Before delegating, say:
    "🤖 Main Agent is delegating."

    After receiving the result, say:
    "🤖 Main Agent received the result."
  `,

  model,

  tools: [
    mathAgent.asTool({
      toolName: "ask_math_agent",

      toolDescription:
        "Delegate mathematical questions to the Math Agent.",
    }),
  ],
});

// --------------------------------
// Run
// --------------------------------

async function main() {
  const result = await run(
    mainAgent,
    "What is 25 multiplied by 8?"
  );

  console.log(result.finalOutput);
}

main().catch(console.error);