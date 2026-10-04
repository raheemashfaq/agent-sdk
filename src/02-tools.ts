import "dotenv/config";

import { Agent, run, tool } from "@openai/agents";
import { aisdk } from "@openai/agents-extensions/ai-sdk";
import { google } from "@ai-sdk/google";
import { z } from "zod";

process.env.GOOGLE_GENERATIVE_AI_API_KEY ??= process.env.GEMINI_API_KEY;

const calculator = tool({
  name: "calculator",
  description: "Perform basic arithmetic calculations.",

  parameters: z.object({
    a: z.number(),
    b: z.number(),
    operation: z.enum(["add", "subtract", "multiply", "divide"]),
  }),

execute: async ({ a, b, operation }) => {
  console.log("🔥 TOOL CALLED");
  console.log("Arguments:", { a, b, operation });

  switch (operation) {
    case "add":
      return a + b;

    case "subtract":
      return a - b;

    case "multiply":
      return a * b;

    case "divide":
      return a / b;
  }
},
});

const getWeather = tool({
  name: "get_weather",
  description: "Get the mock weather for a city.",
  parameters: z.object({
    city: z.string(),
  }),
  execute: async ({ city }) => {
    return `The weather in ${city} is 28°C and sunny.`;
  },
});

const model = aisdk(
  google("gemini-3.6-flash")
);
const agent = new Agent({
  name: "Calculator Agent",

  instructions: `
    You are a helpful calculator assistant.

    Use the calculator tool for arithmetic questions.
    Use the get_weather tool for weather questions.

    Explain each result clearly.
  `,

  model,

  tools: [calculator, getWeather],
});
async function main() {
  const calculation = await run(
    agent,
    "What is 50 multiplied by 20?"
  );

  console.log(calculation.finalOutput);

  const weather = await run(
    agent,
    "What is the weather in Tokyo?"
  );

  console.log(weather.finalOutput);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
