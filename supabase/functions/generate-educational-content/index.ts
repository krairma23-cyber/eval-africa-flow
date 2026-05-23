import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const ContentSchema = z.object({
  type: z.enum(['assessment', 'report', 'analysis']),
  subject: z.string().min(1).max(100),
  level: z.string().min(1).max(50),
  topic: z.string().min(1).max(200),
  difficulty: z.string().min(1).max(50).optional().default('medium'),
  questionsCount: z.number().int().min(1).max(50).optional().default(10),
  duration: z.number().int().min(1).max(300).optional().default(60),
});

const sanitize = (s: string) => s.replace(/[`<>]/g, '').slice(0, 500);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Require authenticated user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    const { data: { user }, error: authErr } = await supabaseAuth.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { type, subject, level, topic, difficulty, questionsCount, duration } = await req.json();
    
    console.log('Generating content:', { type, subject, level, topic, difficulty });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Construire le prompt selon le type
    let systemPrompt = '';
    let userPrompt = '';

    if (type === 'assessment') {
      systemPrompt = `Tu es un expert pédagogue spécialisé dans la création d'évaluations scolaires. 
      Génère des évaluations claires, structurées et adaptées au niveau demandé.`;
      
      userPrompt = `Crée une évaluation complète pour:
- Matière: ${subject}
- Niveau: ${level}
- Sujet: ${topic}
- Difficulté: ${difficulty}
- Nombre de questions: ${questionsCount}
- Durée: ${duration} minutes

Format attendu:
# Évaluation - ${subject}
**Sujet:** ${topic}
**Niveau:** ${level}
**Durée:** ${duration} minutes
**Difficulté:** ${difficulty}

## Questions:
[Génère ${questionsCount} questions adaptées avec barème et critères d'évaluation]

**Total: 20 points**`;
    } else if (type === 'report') {
      systemPrompt = `Tu es un expert en analyse de performances scolaires. 
      Génère des rapports détaillés basés sur des analyses statistiques réalistes.`;
      
      userPrompt = `Crée un rapport de performance pour:
- Matière: ${subject}
- Niveau: ${level}
- Sujet d'analyse: ${topic}

Inclus:
- Statistiques de classe (moyenne, médiane, écart-type)
- Points forts identifiés
- Axes d'amélioration
- Prédictions et recommandations`;
    } else {
      systemPrompt = `Tu es un expert en analyse prédictive pour l'éducation. 
      Génère des analyses détaillées avec insights et recommandations personnalisées.`;
      
      userPrompt = `Crée une analyse prédictive pour:
- Matière: ${subject}
- Niveau: ${level}
- Focus: ${topic}

Inclus:
- Tendances détectées
- Patterns comportementaux
- Recommandations personnalisées pour enseignants et élèves
- Prédictions futures basées sur les données`;
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
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'Limite de requêtes dépassée. Veuillez réessayer dans quelques instants.' 
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: 'Crédits IA insuffisants. Veuillez recharger votre compte.' 
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI Gateway error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content generated');
    }

    console.log('Content generated successfully');

    return new Response(
      JSON.stringify({ 
        content,
        metadata: {
          subject,
          level,
          duration: duration ? `${duration} min` : null,
          difficulty
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in generate-educational-content:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Erreur lors de la génération du contenu' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
