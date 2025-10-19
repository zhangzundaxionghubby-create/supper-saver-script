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
    const { 
      protein, 
      carbs, 
      calories, 
      dietaryRestrictions, 
      numberOfRecipes, 
      numberOfPeople, 
      mealsPerDay 
    } = await req.json();

    console.log("Generating recipes with params:", { protein, carbs, calories, dietaryRestrictions, numberOfRecipes, numberOfPeople, mealsPerDay });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a professional meal planning assistant. Generate detailed, practical recipes.

IMPORTANT: Return ONLY valid JSON in this exact format, with no additional text before or after:
{
  "recipes": [
    {
      "name": "Recipe Name",
      "servings": number,
      "prepTime": "X minutes",
      "cookTime": "X minutes",
      "protein": number,
      "carbs": number,
      "calories": number,
      "ingredients": ["ingredient 1", "ingredient 2"],
      "instructions": ["step 1", "step 2"]
    }
  ]
}`;

    const userPrompt = `Generate ${numberOfRecipes} diverse and varied recipes with the following requirements:
- Protein per serving: ${protein}g
- Carbohydrates per serving: ${carbs}g
- Calories per serving: ${calories}
- Dietary restrictions: ${dietaryRestrictions || 'None'}
- Number of people: ${numberOfPeople}

Generate a wide variety of recipes for different meal types (breakfast, lunch, dinner).
Do NOT assign days or meal types - just generate the recipes.
Ensure each recipe is practical, detailed, and meets the nutritional requirements.
Return ONLY the JSON object, no additional text.`;

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
    let recipes;
    try {
      // Try to parse the entire response as JSON first
      recipes = JSON.parse(content);
    } catch (e) {
      // If that fails, try to extract JSON from markdown code blocks
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        recipes = JSON.parse(jsonMatch[1]);
      } else {
        // Try to find JSON object in the text
        const jsonStart = content.indexOf('{');
        const jsonEnd = content.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
          recipes = JSON.parse(content.substring(jsonStart, jsonEnd + 1));
        } else {
          throw new Error("Could not extract JSON from AI response");
        }
      }
    }

    console.log("Parsed recipes:", recipes);

    return new Response(JSON.stringify(recipes), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate-recipes function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" }), 
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
