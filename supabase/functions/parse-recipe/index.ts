import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { recipeName, recipeDetails } = await req.json();
    console.log('Parsing recipe:', recipeName);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are a culinary expert assistant. Extract structured recipe information from user-provided recipe details.
Always provide realistic and accurate estimates for servings, times, and nutritional values.
Ensure all ingredients are listed with quantities and units.`;

    const userPrompt = `Recipe Name: ${recipeName}
Recipe Details: ${recipeDetails}

Please extract and provide the following information in JSON format:
- servings: number of servings (integer)
- prepTime: preparation time (string like "15 mins")
- cookTime: cooking time (string like "30 mins")
- protein: protein per serving in grams (integer)
- carbs: carbohydrates per serving in grams (integer)
- calories: calories per serving (integer)
- ingredients: array of ingredient strings with quantities (e.g., ["200g chicken breast", "1 tbsp olive oil"])`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_recipe_info",
              description: "Extract structured recipe information from recipe details",
              parameters: {
                type: "object",
                properties: {
                  servings: { type: "integer", description: "Number of servings" },
                  prepTime: { type: "string", description: "Preparation time (e.g., '15 mins')" },
                  cookTime: { type: "string", description: "Cooking time (e.g., '30 mins')" },
                  protein: { type: "integer", description: "Protein per serving in grams" },
                  carbs: { type: "integer", description: "Carbohydrates per serving in grams" },
                  calories: { type: "integer", description: "Calories per serving" },
                  ingredients: { 
                    type: "array", 
                    items: { type: "string" },
                    description: "List of ingredients with quantities"
                  }
                },
                required: ["servings", "prepTime", "cookTime", "protein", "carbs", "calories", "ingredients"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "extract_recipe_info" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to your workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error('Failed to parse recipe with AI');
    }

    const data = await response.json();
    console.log('AI response:', JSON.stringify(data));

    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || !toolCall.function?.arguments) {
      throw new Error('No structured output received from AI');
    }

    const recipeInfo = JSON.parse(toolCall.function.arguments);
    console.log('Extracted recipe info:', recipeInfo);

    return new Response(JSON.stringify(recipeInfo), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in parse-recipe function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
