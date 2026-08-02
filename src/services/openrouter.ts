import type { DashboardData } from "../types/dashboard";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = "openai/gpt-4o-mini";
const LS_KEY = "learnarena_openrouter_key";

function getSystemPrompt(): string {
  return `You are an expert study assistant that transforms raw course notes into a structured, interactive study dashboard.

You must output ONLY valid JSON — no markdown, no code fences, no commentary. The JSON must exactly match the following schema:

{
  "moduleTitle": "string — the topic title, e.g. 'Intro to Neuroscience: The Action Potential'",
  "synthesis": {
    "keyTakeaways": ["string — 5-8 concise bullet-point takeaways from the notes"]
  },
  "concepts": [
    {
      "term": "string — key term or concept",
      "definition": "string — clear, concise definition",
      "analogy": "string — a memorable real-world analogy to help understand the concept",
      "xpBadge": "number — XP value for this concept (10-50)"
    }
  ],
  "contextMap": [
    {
      "id": "string — unique node ID (e.g. 'node-1')",
      "label": "string — short label for the node",
      "x": "number — x position (0-400, for layout)",
      "y": "number — y position (0-300, for layout)",
      "connections": ["string — array of node IDs this node connects to"]
    }
  ],
  "scenario": {
    "setup": "string — a case study scenario or real-world situation based on the material",
    "question": "string — the question asking what action should be taken",
    "actions": [
      {
        "label": "string — short action label, e.g. 'Diagnose Cause'",
        "isCorrect": "boolean — exactly ONE action must be true",
        "explanation": "string — detailed explanation of why this action is correct or incorrect"
      }
    ]
  },
  "diagnosticQuest": {
    "questions": [
      {
        "question": "string — MCQ question",
        "options": ["string — 4 answer options, A through D"],
        "correctIndex": "number — index (0-3) of the correct option",
        "socraticHint": "string — a guided question to help the student reason toward the answer, not the answer itself"
      }
    ]
  },
  "masteryProgress": {
    "currentXp": "number — starting XP, e.g. 50",
    "maxXp": "number — max XP needed, e.g. 200",
    "streak": "number — starting streak days, e.g. 1"
  },
  "coWorkingArena": {
    "entries": [
      {
        "rank": "number — 1-based rank",
        "name": "string — display name",
        "avatar": "string — initials for avatar, e.g. 'SK'",
        "xp": "number — total XP for this entry",
        "isCurrentUser": "boolean — true for exactly one entry (the user)"
      }
    ]
  }
}

RULES:
- Generate 5-8 key takeaways
- Generate 4-6 core concepts
- Generate 4-6 context map nodes with meaningful connections
- Generate exactly 1 scenario with 3-4 actions (one correct)
- Generate exactly 5 diagnostic questions (each with 4 options)
- Generate 5-6 leaderboard entries, one of which is the current user
- Use realistic, educational content based on the provided notes
- Make the scenario and questions challenging but fair
- The context map x/y coordinates should arrange nodes in a logical layout (central concept in middle, related concepts around it)
- All fields must be populated — no empty arrays or null values`;
}

export class OpenRouterError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly code?: string
  ) {
    super(message);
    this.name = "OpenRouterError";
  }
}

export async function generateDashboard(
  notes: string,
  model?: string
): Promise<DashboardData> {
  const apiKey = localStorage.getItem(LS_KEY);

  if (!apiKey) {
    throw new OpenRouterError(
      "OpenRouter API key not found. Please enter your key in the settings.",
      undefined,
      "MISSING_KEY"
    );
  }

  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": window.location.origin,
      "X-OpenRouter-Title": "LearnArena",
    },
    body: JSON.stringify({
      model: model || DEFAULT_MODEL,
      messages: [
        { role: "system", content: getSystemPrompt() },
        {
          role: "user",
          content: `Here are my course notes. Please generate a complete study dashboard based on them:\n\n${notes}`,
        },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const status = response.status;
    let message = `OpenRouter API error (${status})`;

    if (status === 401) {
      message =
        "Invalid API key. Please check your OpenRouter key and try again.";
    } else if (status === 429) {
      message =
        "Rate limited. You've sent too many requests. Please wait a moment and try again.";
    } else if (status === 402) {
      message =
        "Insufficient credits. Please add funds to your OpenRouter account.";
    } else if (status >= 500) {
      message =
        "OpenRouter server error. Please try again in a moment.";
    }

    throw new OpenRouterError(message, status);
  }

  let data: any;
  try {
    data = await response.json();
  } catch {
    throw new OpenRouterError(
      "Failed to parse the API response. Please try again."
    );
  }

  const content = data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new OpenRouterError(
      "The API returned an empty response. Please try again."
    );
  }

  let parsed: DashboardData;
  try {
    parsed = JSON.parse(content) as DashboardData;
  } catch {
    throw new OpenRouterError(
      "Failed to parse the generated study content. The response was not valid JSON. Please try again."
    );
  }

  // Basic validation
  if (!parsed.moduleTitle || !parsed.synthesis || !parsed.concepts || !parsed.scenario) {
    throw new OpenRouterError(
      "The generated dashboard is missing required fields. Please try again."
    );
  }

  return parsed;
}