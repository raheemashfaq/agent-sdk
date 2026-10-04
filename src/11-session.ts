import "dotenv/config";
process.env.GOOGLE_GENERATIVE_AI_API_KEY ??= process.env.New_GEMINI_API_KEY;

import {
  Agent,
  MemorySession,
  run,
} from "@openai/agents";

import { aisdk } from "@openai/agents-extensions/ai-sdk";
import { google } from "@ai-sdk/google";

const model = aisdk(
  google("gemini-3.8-flash")
);

const agent = new Agent({
  name: "Memory Agent",

  instructions: `
    You are a helpful assistant.
    Remember information from the conversation.
  `,

  model,
});

// --------------------------------
// Create Session
// --------------------------------

const abdulSession = new MemorySession();
const ahmedSession = new MemorySession();
const saraSession = new MemorySession();
// --------------------------------
// Conversation
// --------------------------------

async function main() {
  await run(agent, "My name is Abdul, and I am learning AI agents.", {
    session: abdulSession,
  });
  await run(agent, "My name is Ahmed, and I am learning Python.", {
    session: ahmedSession,
  });
  await run(agent, "My name is Sara, and I am learning React.", {
    session: saraSession,
  });

  const abdulResult = await run(
    agent,
    "What is my name and what am I learning?",
    { session: abdulSession }
  );
  const ahmedResult = await run(
    agent,
    "What is my name and what am I learning?",
    { session: ahmedSession }
  );
  const saraResult = await run(
    agent,
    "What is my name and what am I learning?",
    { session: saraSession }
  );

  console.log(`Session A → ${abdulResult.finalOutput}`);
  console.log(`Session B → ${ahmedResult.finalOutput}`);
  console.log(`Session C → ${saraResult.finalOutput}`);
}

main().catch(console.error);