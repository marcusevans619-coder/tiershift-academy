import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function getTranscript(videoId: string): Promise<string> {
  try {
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    const html = await res.text();
    
    const captionMatch = html.match(/"captionTracks":(\[.*?\])/);
    if (!captionMatch) return "";
    
    const tracks = JSON.parse(captionMatch[1]);
    const englishTrack = tracks.find((t: any) => 
      t.languageCode === "en" || t.languageCode === "en-US"
    ) || tracks[0];
    
    if (!englishTrack?.baseUrl) return "";
    
    const transcriptRes = await fetch(englishTrack.baseUrl);
    const xml = await transcriptRes.text();
    
    const text = xml
      .replace(/<[^>]+>/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, " ")
      .trim();
    
    return text.slice(0, 12000);
  } catch {
    return "";
  }
}

async function generateOutline(
  transcript: string,
  moduleName: string,
  videoTitle: string,
  anthropicKey: string
): Promise<string> {
  const hasTranscript = transcript.length > 100;
  
  const prompt = hasTranscript
    ? `You are an IT training content writer for TierShift Academy.

A learner just watched this YouTube video:
Title: "${videoTitle}"
Module: "${moduleName}"

Here is the full transcript:
${transcript}

Based on the transcript, write a practical lesson report in exactly this format:

## What This Video Covers
2-3 sentences summarizing what the video teaches.

## Key Concepts
List and explain 4-6 core concepts from the video in plain language. No jargon without explanation.

## Real-World Scenarios
Describe 2-3 real IT workplace situations where this knowledge applies. Be specific — name the tools, the problem, and the solution.

## Commands & Tools Mentioned
List any specific commands, tools, software, or platforms mentioned in the video. If none, write "No specific commands covered."

## Key Takeaways
5-6 bullet points of the most important things to remember from this video.

Keep everything practical and aimed at IT support professionals (Tier 1-2 techs).`
    : `You are an IT training content writer for TierShift Academy.

Write a practical lesson report for the module "${moduleName}" based on the video titled "${videoTitle}".

Use exactly this format:

## What This Video Covers
2-3 sentences summarizing what this topic covers.

## Key Concepts
List and explain 4-6 core concepts in plain language.

## Real-World Scenarios
Describe 2-3 real IT workplace situations where this knowledge applies.

## Commands & Tools Mentioned
List relevant commands, tools, or platforms for this topic.

## Key Takeaways
5-6 bullet points of the most important things to remember.

Keep everything practical and aimed at IT support professionals (Tier 1-2 techs).`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": anthropicKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await res.json();
  return data.content?.[0]?.text || "Generation failed.";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { videoId, videoTitle, moduleName } = await req.json();
    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY") ?? "";

    if (!videoId || !moduleName) {
      return new Response(
        JSON.stringify({ error: "Missing videoId or moduleName" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const transcript = await getTranscript(videoId);
    const outline = await generateOutline(transcript, moduleName, videoTitle, anthropicKey);
    const usedTranscript = transcript.length > 100;

    return new Response(
      JSON.stringify({ outline, usedTranscript }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});