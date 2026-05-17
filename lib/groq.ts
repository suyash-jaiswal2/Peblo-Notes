import Groq from "groq-sdk";

export const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export interface AiGenerationResult {
  summary: string;
  actionItems: string[];
  suggestedTitle: string;
}

export async function generateNoteInsights(
  title: string,
  content: string
): Promise<AiGenerationResult> {
  const cleanContent = content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

  if (cleanContent.length < 20) {
    return {
      summary: "Note content is too short to analyze.",
      actionItems: [],
      suggestedTitle: title || "Untitled Note",
    };
  }

  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    max_tokens: 800,
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant that analyzes notes. Always respond with valid JSON only. No markdown, no explanation, no code fences.",
      },
      {
        role: "user",
        content: `Analyze this note and respond ONLY with a JSON object.

Title: ${title || "Untitled"}
Content: ${cleanContent.slice(0, 3000)}

Required JSON structure:
{
  "summary": "2-3 sentence summary of the note",
  "actionItems": ["action item 1", "action item 2"],
  "suggestedTitle": "concise descriptive title"
}`,
      },
    ],
  });

  const text = completion.choices[0]?.message?.content || "";

  try {
    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
    return {
      summary: parsed.summary || "Unable to generate summary.",
      actionItems: Array.isArray(parsed.actionItems) ? parsed.actionItems : [],
      suggestedTitle: parsed.suggestedTitle || title || "Untitled",
    };
  } catch {
    return {
      summary: text.slice(0, 200),
      actionItems: [],
      suggestedTitle: title || "Untitled",
    };
  }
}