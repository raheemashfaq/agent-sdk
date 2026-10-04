import "dotenv/config";

import { Agent, run } from "@openai/agents";
import { aisdk } from "@openai/agents-extensions/ai-sdk";
import { google } from "@ai-sdk/google";

process.env.GOOGLE_GENERATIVE_AI_API_KEY ??= process.env.GEMINI_API_KEY;

const model = aisdk(
  google("gemini-3.6-flash")
);

const agent = new Agent({
  name: "AI Mentor",

  instructions: `
    You are an AI development mentor.
    Explain concepts clearly.
    Use simple examples.
  `,

  model,
});

async function main() {
  const result = await run(
    agent,
    "Reply with exactly: GEMINI_AGENT_WORKING"
  );

  console.log(result.finalOutput);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});