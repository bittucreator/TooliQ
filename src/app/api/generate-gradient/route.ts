import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const endpointBase = process.env.AZURE_OPENAI_ENDPOINT!.replace(/\/?$/, "");
const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME!;
const apiVersion = process.env.AZURE_OPENAI_API_VERSION || "2024-02-15-preview";

async function getAccessToken() {
  // Directly return the API key from environment variables
  return process.env.AZURE_OPENAI_API_KEY!;
}

async function generateGradient(prompt: string) {
  const accessToken = await getAccessToken();
  const url = `${endpointBase}/openai/deployments/${deploymentName}/chat/completions?api-version=${apiVersion}`;
  const systemPrompt = `You are an AI gradient generator for web designers. Generate CSS gradient configurations based on user descriptions.\n\nReturn your response as a valid JSON object with this exact structure:\n{\n  \"type\": \"linear\" | \"radial\" | \"conic\",\n  \"direction\": number (0-360 for linear/conic, ignored for radial),\n  \"stops\": [\n    { \"color\": \"#hexcode\", \"position\": number (0-100) }\n  ]\n}\n\nGuidelines:\n- Choose 2-5 color stops that create a beautiful gradient\n- Use hex color codes\n- For linear gradients, direction is in degrees (0-360)\n- Position values should be between 0-100\n- Consider the mood and context of the user's prompt\n- Create visually appealing color combinations that work well for web design\n\nExamples:\n- \"sunset\" might use warm oranges, reds, and purples\n- \"ocean\" might use blues and teals\n- \"forest\" might use greens and browns\n- \"cyberpunk\" might use neon colors like purples, blues, and pinks`;
  const response = await axios.post(
    url,
    {
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Generate a gradient for: ${prompt}` }
      ],
      max_tokens: 500,
      temperature: 0.8
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      }
    }
  );
  return response.data;
}

interface GradientStop {
  color: string;
  position: number;
}

interface GradientResponse {
  type: "linear" | "radial" | "conic";
  direction: number;
  stops: GradientStop[];
}

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const response = await generateGradient(prompt);

    // Assert the response type to avoid 'unknown' error
    const aiResponse = response as {
      choices?: { message?: { content?: string } }[];
    };

    const content = aiResponse.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("No response from AI");
    }

    // Parse the AI response as JSON
    const gradientConfig: GradientResponse = JSON.parse(content);

    return NextResponse.json(gradientConfig);
  } catch (error) {
    console.error("Error generating AI gradient:", error);
    
    // Fallback to random gradient if AI fails
    const fallbackGradient: GradientResponse = {
      type: "linear",
      direction: Math.floor(Math.random() * 360),
      stops: [
        { color: "#667eea", position: 0 },
        { color: "#764ba2", position: 100 }
      ]
    };

    return NextResponse.json(fallbackGradient);
  }
}
