import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { mealDescription } = await req.json();

    if (!mealDescription) {
      return new Response(
        JSON.stringify({ error: 'Meal description is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `You are a nutrition expert. Given a meal description, estimate the nutritional content as accurately as possible.
Return ONLY a valid JSON object with this exact structure (no additional text):
{
  "name": "meal name",
  "mealType": "Breakfast/Lunch/Dinner/Snack",
  "calories": number,
  "protein": number (in grams),
  "carbs": number (in grams),
  "salt": number (in grams),
  "saturatedFat": number (in grams),
  "unsaturatedFat": number (in grams),
  "fibre": number (in grams),
  "vitamins": {
    "vitaminA": number (in micrograms),
    "vitaminB1": number (in mg),
    "vitaminB2": number (in mg),
    "vitaminB3": number (in mg),
    "vitaminB6": number (in mg),
    "vitaminB12": number (in micrograms),
    "vitaminC": number (in mg),
    "vitaminD": number (in micrograms),
    "vitaminE": number (in mg),
    "vitaminK": number (in micrograms),
    "folate": number (in micrograms)
  }
}`;

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
          { role: 'user', content: `Estimate the nutritional content for this meal: ${mealDescription}` }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to estimate nutrients' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error('No content in AI response:', data);
      return new Response(
        JSON.stringify({ error: 'Invalid AI response' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse the AI response
    let nutrients;
    try {
      // Remove any markdown code blocks if present
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      nutrients = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      return new Response(
        JSON.stringify({ error: 'Failed to parse nutrient data' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify(nutrients),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in estimate-nutrients function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});