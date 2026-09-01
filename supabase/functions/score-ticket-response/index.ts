// supabase/functions/score-ticket-response/index.ts
//
// Input:  { ticket: {...}, response: string, difficulty: string }
// Output: { score, whatGotRight, whatWasMissing, strongExample }

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const OPENROUTER_MODEL = "nex-agi/nex-n2-pro";

interface ScorePayload {
  score: number;
  whatGotRight: string[];
  whatWasMissing: string[];
  strongExample: string;
}

function buildPrompt(
  ticket: { subject: string; body: string; notes: string; priority: string },
  difficulty: string,
  learnerResponse: string,
): string {
  return `You are grading a helpdesk trainee's response to a support ticket in an IT training simulator.

Ticket (priority: ${ticket.priority}):
Subject: ${ticket.subject}
Body: ${ticket.body}
Internal notes: ${ticket.notes || "none"}

Difficulty level: ${difficulty}

Trainee's submitted resolution:
"""
${learnerResponse}
"""

Grade holistically against what a competent helpdesk technician at this difficulty level
would be expected to do: correct diagnosis, appropriate troubleshooting steps in a sensible
order, clear/professional communication back to the requester, and appropriate escalation
if the issue is beyond tier-1 scope. Do not penalize for stylistic differences if the
substance is correct. Be specific and constructive, not generic.

Respond with ONLY raw JSON, no markdown fences, no preamble, matching this exact shape:
{
  "score": <integer 0-100>,
  "whatGotRight": ["short bullet", "short bullet"],
  "whatWasMissing": ["short bullet", "short bullet"],
  "strongExample": "a 2-4 sentence example of a strong response to this exact ticket"
}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { ticket, response, difficulty } = await req.json();

    if (!ticket || !response || typeof response !== "string") {
      return new Response(
        JSON.stringify({ error: "ticket and response are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (response.trim().length < 10) {
      return new Response(
        JSON.stringify({ error: "Response too short to score meaningfully" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const openRouterKey = Deno.env.get("OPENROUTER_API_KEY");
    if (!openRouterKey) {
      return new Response(
        JSON.stringify({ error: "OPENROUTER_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const orResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openRouterKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [
          { role: "user", content: buildPrompt(ticket, difficulty ?? "beginner", response) },
        ],
        temperature: 0.3,
      }),
    });

    if (!orResponse.ok) {
      const errText = await orResponse.text();
      return new Response(
        JSON.stringify({ error: `OpenRouter error: ${errText}` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const orData = await orResponse.json();
    const rawText: string = orData.choices?.[0]?.message?.content ?? "";
    const cleaned = rawText.replace(/```json|```/g, "").trim();

    let result: ScorePayload;
    try {
      result = JSON.parse(cleaned);
    } catch {
      return new Response(
        JSON.stringify({ error: "Model did not return valid JSON", raw: rawText }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    result.score = Math.max(0, Math.min(100, Math.round(result.score)));

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});