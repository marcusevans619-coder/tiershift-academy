// supabase/functions/generate-ticket/index.ts
//
// Input:  { lab_id: string }
// Output: { ticket_number, requester_name, priority, subject, body, notes }

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const OPENROUTER_MODEL = "nex-agi/nex-n2-pro";

interface TicketPayload {
  ticket_number: string;
  requester_name: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  subject: string;
  body: string;
  notes: string;
}

function buildPrompt(lab: {
  title: string;
  description: string;
  instructions: string | null;
  difficulty: string;
}): string {
  return `You are generating a single realistic (but fictional) IT helpdesk ticket for a training simulator.

Lab context:
- Title: ${lab.title}
- Description: ${lab.description}
- Difficulty: ${lab.difficulty}
- Scenario instructions: ${lab.instructions ?? "None provided â€” use the title/description to infer a realistic scenario."}

Generate ONE ticket that fits this scenario. Vary the requester name, tone, and specific
details each time â€” do not reuse the same fictional employee names repeatedly.

Match the tone and complexity to the difficulty level:
- beginner: straightforward, single clear issue, calm requester
- intermediate: some ambiguity or missing info, moderate technical detail, requester may be mildly frustrated
- advanced: multi-symptom or edge-case scenario, potential red herrings, less patient requester

Respond with ONLY raw JSON, no markdown fences, no preamble, matching this exact shape:
{
  "ticket_number": "TS-XXXXX",
  "requester_name": "Full Name",
  "priority": "Low" | "Medium" | "High" | "Critical",
  "subject": "short subject line",
  "body": "the ticket description as the requester would write it, 2-5 sentences",
  "notes": "any internal-looking context, e.g. prior ticket history, device info, or empty string if none"
}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { lab_id } = await req.json();
    if (!lab_id) {
      return new Response(JSON.stringify({ error: "lab_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Prefer new-format secret key; fall back to legacy service_role key if not yet available.
    let secretKey: string | undefined;
    const secretKeysRaw = Deno.env.get("SUPABASE_SECRET_KEYS");
    if (secretKeysRaw) {
      try {
        const secretKeys = JSON.parse(secretKeysRaw);
        secretKey = secretKeys.default;
      } catch {
        // fall through to legacy below
      }
    }
    if (!secretKey) {
      secretKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      secretKey!,
    );

    const { data: lab, error: labError } = await supabase
      .from("labs")
      .select("id, title, description, instructions, difficulty, lab_type")
      .eq("id", lab_id)
      .single();

    if (labError || !lab) {
      return new Response(
        JSON.stringify({ error: `Lab not found: ${labError?.message ?? "unknown"}` }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (lab.lab_type !== "ticket") {
      return new Response(
        JSON.stringify({ error: `Lab ${lab_id} is not a ticket-type lab` }),
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
        messages: [{ role: "user", content: buildPrompt(lab) }],
        temperature: 0.9,
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

    let ticket: TicketPayload;
    try {
      ticket = JSON.parse(cleaned);
    } catch {
      return new Response(
        JSON.stringify({ error: "Model did not return valid JSON", raw: rawText }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ lab_id: lab.id, difficulty: lab.difficulty, ticket }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});