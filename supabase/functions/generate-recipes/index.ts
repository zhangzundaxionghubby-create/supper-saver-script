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

    const systemPrompt = `You are a professional meal planning assistant and nutritionist. Generate detailed, practical recipes with ACCURATE calorie calculations.

IMPORTANT: Calculate calories based on the actual ingredients used. Consider typical portion sizes and caloric density of each ingredient. Be precise and realistic.

Return ONLY valid JSON in this exact format, with no additional text before or after:
{
  "recipes": [
    {
      "name": "Recipe Name",
      "servings": number,
      "prepTime": "X minutes",
      "cookTime": "X minutes",
      "protein": number,
      "carbs": number,
      "fat": number,
      "calories": number,
      "ingredients": ["quantity + ingredient (e.g., 200g chicken breast, 1 tbsp olive oil)"]
    }
  ]
}

CRITICAL: Calculate the total calories by summing up the calories from each ingredient, then divide by servings. Include fat macros as they contribute 9 calories per gram.

DO NOT include cooking instructions or steps. Only generate the recipe name, basic info, and ingredients list with quantities.`;

    const userPrompt = `Generate ${numberOfRecipes} diverse and varied recipes with the following requirements:
- Protein per serving: approximately ${protein}g
- Carbohydrates per serving: approximately ${carbs}g
- Target calories per serving: approximately ${calories}
- Dietary restrictions: ${dietaryRestrictions || 'None'}
- Number of people: ${numberOfPeople}

IMPORTANT CALORIE CALCULATION INSTRUCTIONS:
1. List ALL ingredients with specific quantities (e.g., "200g chicken breast", "1 tbsp olive oil", "100g rice")
2. Calculate calories based on standard nutritional values for each ingredient
3. Sum up all calories and divide by the number of servings
4. Ensure the calculation is realistic and matches the ingredients

Generate a wide variety of recipes for different meal types (breakfast, lunch, dinner).
Do NOT assign days or meal types - just generate the recipes.
Do NOT include cooking instructions - only name, nutrition info with accurate calories, and ingredients with quantities.
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
