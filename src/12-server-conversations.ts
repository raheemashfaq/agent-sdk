import "dotenv/config";

process.env.GOOGLE_GENERATIVE_AI_API_KEY ??=
  process.env.New_GEMINI_API_KEY;

import {
  Agent,
  MemorySession,
  run,
} from "@openai/agents";

import { aisdk } from "@openai/agents-extensions/ai-sdk";
import { google } from "@ai-sdk/google";

const model = aisdk(
  google("gemini-3.5-flash-lite")
);

const agent = new Agent({
  name: "Chat Agent",

  instructions: `
    You are a helpful AI assistant.

    Remember information from the current conversation.
  `,

  model,
});

// Maps each conversation ID to its own session
const sessions = new Map<string, MemorySession>();

// Get an existing session or create a new one
function getSession(conversationId: string): MemorySession {
  if (!sessions.has(conversationId)) {
    sessions.set(
      conversationId,
      new MemorySession()
    );
  }

  return sessions.get(conversationId)!;
}

// Simulates a server-side chat endpoint
async function chat(
  conversationId: string,
  message: string
) {
  const session = getSession(conversationId);

  const result = await run(
    agent,
    message,
    { session }
  );

  return result.finalOutput;
}

async function main() {
  // Conversation 1
  console.log("👤 Conversation 001");

  console.log(
    await chat(
      "conv_001",
      "My name is Abdul."
    )
  );

  console.log(
    await chat(
      "conv_001",
      "I am learning AI agents."
    )
  );

  console.log(
    await chat(
      "conv_001",
      "What is my name and what am I learning?"
    )
  );

  // Conversation 2
  console.log("\n👤 Conversation 002");

  console.log(
    await chat(
      "conv_002",
      "My name is Ahmed."
    )
  );

  console.log(
    await chat(
      "conv_002",
      "I am learning Python."
    )
  );

  console.log(
    await chat(
      "conv_002",
      "What is my name and what am I learning?"
    )
  );
}

main().catch(console.error);