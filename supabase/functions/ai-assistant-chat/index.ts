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
    const { message, action } = await req.json();
    
    console.log('AI Assistant request:', { message, action });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Définir le contexte selon l'action demandée
    let systemPrompt = `Tu es l'Assistant IA EvalScol, un assistant pédagogique intelligent spécialisé dans l'éducation africaine francophone. Tu aides les enseignants et administrateurs avec:
- La création d'évaluations personnalisées
- L'analyse des performances des élèves
- La génération de rapports détaillés
- Des recommandations pédagogiques adaptées au contexte africain

Tu réponds de manière concise, claire et professionnelle. Tu t'adaptes au niveau de l'utilisateur et fournis des exemples concrets.`;

    let userPrompt = message;

    // Si une action spécifique est demandée, adapter le prompt
    if (action === 'createAssessment') {
      systemPrompt += '\n\nL\'utilisateur souhaite créer une évaluation. Guide-le en demandant la matière, le niveau, le type d\'évaluation et le nombre de questions souhaité.';
    } else if (action === 'analyzePerformance') {
      systemPrompt += '\n\nL\'utilisateur souhaite analyser des performances. Propose d\'analyser une classe, un élève spécifique, ou une matière particulière.';
    } else if (action === 'generateReport') {
      systemPrompt += '\n\nL\'utilisateur souhaite générer un rapport. Demande quel type de rapport (bulletin, rapport de classe, statistiques) et pour quelle période.';
    }

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
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'Limite de requêtes dépassée. Veuillez réessayer dans quelques instants.',
          code: 'RATE_LIMIT'
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: 'Crédits IA insuffisants. Veuillez recharger votre compte Lovable.',
          code: 'INSUFFICIENT_CREDITS'
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI Gateway error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || 'Désolé, je n\'ai pas pu générer une réponse.';

    console.log('AI response generated successfully');

    return new Response(
      JSON.stringify({ 
        response: aiResponse,
        usage: data.usage 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in ai-assistant-chat:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erreur lors de la communication avec l\'assistant IA',
        code: 'INTERNAL_ERROR'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
