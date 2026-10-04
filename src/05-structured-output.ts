import "dotenv/config";

import { Agent, run } from "@openai/agents";
import { aisdk } from "@openai/agents-extensions/ai-sdk";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import "dotenv/config";

process.env.GOOGLE_GENERATIVE_AI_API_KEY ??= process.env.GEMINI_API_KEY;

const model = aisdk(
  google("gemini-3.6-flash")
);

const MathResult = z.object({
  answer: z.number(),

  operation: z.enum([
    "add",
    "subtract",
    "multiply",
    "divide",
  ]),
});


const agent = new Agent({
  name: "Math Agent",

  instructions: `
    You are a math assistant.
    Solve the user's mathematical question.
    Return the result using the required structured format.
  `,

  model,

  outputType: MathResult,
});



async function main() {
  const result = await run(
    agent,
    "What is 25 multiplied by 4?"
  );

  console.log(result.finalOutput);
}

main().catch(console.error);