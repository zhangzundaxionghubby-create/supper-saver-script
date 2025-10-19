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
    const { existingItems } = await req.json();

    console.log("Generating suggestions for existing items:", existingItems);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a helpful shopping assistant. Based on the user's existing grocery list, suggest 5-8 household and personal care items they might need.

IMPORTANT: Return ONLY valid JSON in this exact format:
{
  "suggestions": ["item 1", "item 2", "item 3"]
}`;

    const userPrompt = `Based on this shopping list: ${existingItems.join(', ')}

Suggest 5-8 common household items, personal care items, or cleaning supplies they might need. Examples include:
- Shampoo, body wash, soap
- Toothpaste, dental floss
- Paper towels, tissues
- Laundry detergent
- Dish soap
- Trash bags
- Cleaning supplies

Return ONLY the JSON object with suggestions.`;

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

    // Extract JSON from the response
    let suggestions;
    try {
      suggestions = JSON.parse(content);
    } catch (e) {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        suggestions = JSON.parse(jsonMatch[1]);
      } else {
        // Try to find JSON object in the text
        const jsonStart = content.indexOf('{');
        const jsonEnd = content.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
          suggestions = JSON.parse(content.substring(jsonStart, jsonEnd + 1));
        } else {
          throw new Error("Could not extract JSON from AI response");
        }
      }
    }

    console.log("Parsed suggestions:", suggestions);

    return new Response(JSON.stringify(suggestions), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in shopping-suggestions function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" }), 
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
