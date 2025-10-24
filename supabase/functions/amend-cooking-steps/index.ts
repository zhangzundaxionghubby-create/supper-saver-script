import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { recipeName, ingredients, servings, currentInstructions, feedback } = await req.json();

    console.log("Amending cooking steps based on feedback for:", recipeName);
    console.log("Feedback:", feedback);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a professional chef instructor. You previously generated cooking instructions, but the user has feedback. Update the instructions based on their feedback while maintaining quality and clarity.

IMPORTANT: Return ONLY valid JSON in this exact format:
{
  "instructions": [
    "Step 1: Detailed instruction...",
    "Step 2: Detailed instruction...",
    "Step 3: Detailed instruction..."
  ],
  "cookingTips": [
    "Tip 1: Helpful cooking tip...",
    "Tip 2: Another useful tip..."
  ]
}`;

    const userPrompt = `Here are the current cooking instructions for ${recipeName}:

${currentInstructions.map((step: string, i: number) => `${i + 1}. ${step}`).join('\n')}

The user has this feedback: "${feedback}"

Please generate IMPROVED cooking instructions that address this feedback. Keep the same recipe with these ingredients: ${ingredients.join(', ')} for ${servings} servings.

Provide:
1. Updated step-by-step cooking instructions (8-12 steps) that incorporate the user's feedback
2. 3-5 helpful cooking tips and techniques

Return ONLY the JSON object.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), 
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your Lovable workspace." }), 
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log("Raw AI response:", content);

    let result;
    try {
      result = JSON.parse(content);
    } catch (e) {
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[1]);
      } else {
        const jsonStart = content.indexOf('{');
        const jsonEnd = content.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
          result = JSON.parse(content.substring(jsonStart, jsonEnd + 1));
        } else {
          throw new Error("Could not extract JSON from AI response");
        }
      }
    }

    console.log("Amended cooking steps:", result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in amend-cooking-steps function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" }), 
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
