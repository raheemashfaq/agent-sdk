import "dotenv/config";
import { z } from "zod";
import { Agent, run,tool } from "@openai/agents";
import { aisdk } from "@openai/agents-extensions/ai-sdk";
import { google } from "@ai-sdk/google";
process.env.GOOGLE_GENERATIVE_AI_API_KEY ??= process.env.GEMINI_API_KEY;

const model = aisdk(
  google("gemini-3.6-flash")
);

// -------------------------
// Math Agent
// -------------------------

const mathAgent = new Agent({
  name: "Math Agent",

  instructions: `
    You are a math specialist.

    When you receive a request, first say:
    "🔢 Math Agent received the request."

    Then solve the mathematical question.
  `,

  model,
});
const getWeather = tool({
  name: "get_weather",

  description: "Get the current weather for a city.",

  parameters: z.object({
    city: z.string(),
  }),

  execute: async ({ city }) => {
    console.log("🌤️ WEATHER TOOL CALLED:", city);

    // 1. Find city coordinates
    const geoResponse = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
    );

    if (!geoResponse.ok) {
      throw new Error("Geocoding request failed");
    }

    const geoData = await geoResponse.json();

    if (!geoData.results?.length) {
      return `Could not find the city: ${city}`;
    }

    const location = geoData.results[0];

    console.log("📍 Location:", {
      latitude: location.latitude,
      longitude: location.longitude,
    });

    // 2. Get weather
    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m`
    );

    if (!weatherResponse.ok) {
      throw new Error("Weather request failed");
    }

    const weatherData = await weatherResponse.json();

    console.log("🌡️ Weather:", weatherData.current);

    // 3. Return useful data
    return {
      city: location.name,
      temperature: weatherData.current.temperature_2m,
      humidity: weatherData.current.relative_humidity_2m,
      apparentTemperature:
        weatherData.current.apparent_temperature,
      weatherCode: weatherData.current.weather_code,
      windSpeed: weatherData.current.wind_speed_10m,
    };
  },
});

// -------------------------
// Weather Agent
// -------------------------
const weatherAgent = new Agent({
  name: "Weather Agent",

  instructions: `
    You are a weather specialist.

    When the user asks about weather,
    always use the get_weather tool.

    Give the user a clear answer using
    the data returned by the tool.
  `,

  model,

  tools: [getWeather],
});

// -------------------------
// Triage Agent
// -------------------------

const triageAgent = Agent.create({
  name: "Triage Agent",

  instructions: `
    You are a routing assistant.

    Decide which specialist should handle the user's request.

    - Mathematical questions → Math Agent
    - Weather questions → Weather Agent

    If the question is about math, hand it off to Math Agent.
    If the question is about weather, hand it off to Weather Agent.
  `,

  model,

  handoffs: [
    mathAgent,
    weatherAgent,
  ],
});

// -------------------------
// Run
// -------------------------

async function main() {
  const result = await run(
    triageAgent,
    "What's the current weather in Lahore?"
  );

  console.log(result.finalOutput);
}

main().catch(console.error);