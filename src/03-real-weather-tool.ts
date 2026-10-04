import "dotenv/config";

process.env.GOOGLE_GENERATIVE_AI_API_KEY ??= process.env.GEMINI_API_KEY;

console.log(
  "API KEY LOADED:",
  process.env.GOOGLE_GENERATIVE_AI_API_KEY ? "YES" : "NO"
);
import { Agent, run, tool } from "@openai/agents";
import { aisdk } from "@openai/agents-extensions/ai-sdk";
import { google } from "@ai-sdk/google";
import { z } from "zod";

const getWeather = tool({
  name: "get_weather",

  description: "Get the current weather for a city.",

  parameters: z.object({
    city: z.string(),
  }),

  execute: async ({ city }) => {
    console.log("🌤️ WEATHER TOOL CALLED:", city);

    const geoResponse = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
    );

    const geoData = await geoResponse.json();

    if (!geoData.results?.length) {
      return `Could not find the city: ${city}`;
    }

    const location = geoData.results[0];

    console.log("📍 Location:", {
      latitude: location.latitude,
      longitude: location.longitude,
    });
    const weatherResponse = await fetch(
  `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m`
);

const weatherData = await weatherResponse.json();

console.log("🌡️ Weather:", weatherData.current);
return {
  city: location.name,
  latitude: location.latitude,
  longitude: location.longitude,
  temperature: weatherData.current.temperature_2m,
  humidity: weatherData.current.relative_humidity_2m,
  apparentTemperature: weatherData.current.apparent_temperature,
  weatherCode: weatherData.current.weather_code,
  windSpeed: weatherData.current.wind_speed_10m,
};
  },
});

const model = aisdk(
  google("gemini-3.8-flash")
);

const agent = new Agent({
  name: "Weather Agent",

  instructions: `
    You are a helpful weather assistant.
    When the user asks about weather,
    use the get_weather tool.
  `,

  model,

  tools: [getWeather],
});

async function main() {
  const result = await run(
    agent,
    "What's the current weather in Lahore?"
  );

  console.log(result.finalOutput);
}

main().catch(console.error);