import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function getTranscript(videoId: string): Promise<string> {
  try {
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    const html = await res.text();
    const captionMatch = html.match(/"captionTracks":(\[.*?\])/);
    if (!captionMatch) return "";
    const tracks = JSON.parse(captionMatch[1]);
    const englishTrack = tracks.find((t: any) => t.languageCode === "en" || t.languageCode === "en-US") || tracks[0];
    if (!englishTrack?.baseUrl) return "";
    const transcriptRes = await fetch(englishTrack.baseUrl);
    const xml = await transcriptRes.text();
    return xml.replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, " ").trim().slice(0, 12000);
  } catch {
    return "";
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { videoId, videoTitle, moduleName } = await req.json();
    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY") ?? "";

    console.log("Key length:", anthropicKey.length);
    console.log("Key prefix:", anthropicKey.slice(0, 20));

    if (!videoId || !moduleName) {
      return new Response(JSON.stringify({ error: "Missing videoId or moduleName" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const transcript = await getTranscript(videoId);
    const hasTranscript = transcript.length > 100;

    const prompt = hasTranscript
      ? `You are an IT training content writer. Based on this transcript for "${moduleName}" (video: "${videoTitle}"):

${transcript}

Write a lesson report in this exact format:

## What This Video Covers
2-3 sentences summarizing the video.

## Key Concepts
4-6 core concepts explained in plain language.

## Real-World Scenarios
2-3 real IT workplace situations where this applies.

## Commands & Tools Mentioned
Specific commands, tools, or platforms from the video.

## Key Takeaways
5-6 bullet points of the most important things to remember.`
      : `You are an IT training content writer. Write a lesson report for the module "${moduleName}" based on the video "${videoTitle}".

Use this exact format:

## What This Video Covers
2-3 sentences summarizing the topic.

## Key Concepts
4-6 core concepts explained in plain language.

## Real-World Scenarios
2-3 real IT workplace situations where this applies.

## Commands & Tools Mentioned
Relevant commands, tools, or platforms for this topic.

## Key Takeaways
5-6 bullet points of the most important things to remember.`;

    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1500,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const anthropicData = await anthropicRes.json();
    console.log("Anthropic status:", anthropicRes.status);
    console.log("Anthropic response:", JSON.stringify(anthropicData).slice(0, 500));

    if (!anthropicRes.ok) {
      return new Response(JSON.stringify({ 
        error: "Anthropic API error", 
        status: anthropicRes.status,
        detail: anthropicData 
      }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const outline = anthropicData.content?.[0]?.text || "No content returned";

    return new Response(JSON.stringify({ outline, usedTranscript: hasTranscript }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});