import "dotenv/config";

import { Agent, run, tool } from "@openai/agents";
import { aisdk } from "@openai/agents-extensions/ai-sdk";
import { google } from "@ai-sdk/google";
import { z } from "zod";
process.env.GOOGLE_GENERATIVE_AI_API_KEY ??= process.env.GEMINI_API_KEY;

const model = aisdk(
  google("gemini-3.6-flash")
);

// Tool
const calculator = tool({
  name: "calculator",
  description: "Perform basic arithmetic calculations.",

  parameters: z.object({
    a: z.number(),
    b: z.number(),
    operation: z.enum([
      "add",
      "subtract",
      "multiply",
      "divide",
    ]),
  }),

  execute: async ({ a, b, operation }) => {
    console.log("🔧 TOOL CALLED");
    console.log({ a, b, operation });

    let answer: number;

    switch (operation) {
      case "add":
        answer = a + b;
        break;

      case "subtract":
        answer = a - b;
        break;

      case "multiply":
        answer = a * b;
        break;

      case "divide":
        answer = a / b;
        break;
    }

    return {
      answer,
      operation,
      expression: `${a} ${operation} ${b}`,
    };
  },
});

// Structured output schema
const MathResult = z.object({
  answer: z.number(),

  operation: z.enum([
    "add",
    "subtract",
    "multiply",
    "divide",
  ]),

  expression: z.string(),
});

const agent = new Agent({
  name: "Math Agent",

  instructions: `
    You are a math assistant.

    Always use the calculator tool to perform calculations.

    After getting the tool result, return the result
    using the required structured output format.
  `,

  model,

  tools: [calculator],

  outputType: MathResult,
});

async function main() {
  const questions = [
    "What is 12 * 8?",
    "What is 10 + 5?",
    "What is 100 / 4?",
  ];

  for (const question of questions) {
    const result = await run(agent, question);

    console.log(`📦 ${question}`);
    console.log(result.finalOutput);
  }
}

main().catch(console.error);