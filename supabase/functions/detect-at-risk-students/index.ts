import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AssessmentScore {
  student_id: string;
  score: number;
  assessment_date: string;
  max_score: number;
  student_name: string;
  classroom_name: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Require authenticated admin caller
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    const { data: { user: caller }, error: authErr } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    if (authErr || !caller) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    const { data: isAdmin } = await supabase.rpc('has_role', {
      _user_id: caller.id, _role: 'admin'
    });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: 'Forbidden: admin only' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    // Caller's school — used to scope detection and notifications
    const { data: callerProfile } = await supabase
      .from('profiles').select('school_id').eq('user_id', caller.id).maybeSingle();
    const callerSchoolId = callerProfile?.school_id;
    if (!callerSchoolId) {
      return new Response(JSON.stringify({ error: 'Caller has no school' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }


    // Récupérer les résultats récents (3 derniers mois)
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const { data: assessmentResults, error: resultsError } = await supabase
      .from('assessment_results')
      .select(`
        score,
        student_id,
        students!inner(
          id,
          first_name,
          last_name,
          school_id
        ),
        assessments!inner(
          assessment_date,
          max_score,
          classroom_subjects!inner(
            classrooms!inner(
              name
            )
          )
        )
      `)
      .eq('students.school_id', callerSchoolId)
      .gte('assessments.assessment_date', threeMonthsAgo.toISOString())
      .not('score', 'is', null);

    if (resultsError) {
      console.error('Error fetching assessment results:', resultsError);
      throw resultsError;
    }


    // Grouper par élève
    const studentScores = new Map<string, AssessmentScore[]>();
    
    for (const result of assessmentResults || []) {
      const studentId = result.student_id;
      const score = result.score;
      const maxScore = result.assessments.max_score;
      const percentage = (score / maxScore) * 100;
      
      const scoreData: AssessmentScore = {
        student_id: studentId,
        score: percentage,
        assessment_date: result.assessments.assessment_date,
        max_score: maxScore,
        student_name: `${result.students.first_name} ${result.students.last_name}`,
        classroom_name: result.assessments.classroom_subjects.classrooms.name
      };

      if (!studentScores.has(studentId)) {
        studentScores.set(studentId, []);
      }
      studentScores.get(studentId)!.push(scoreData);
    }


    // Analyser chaque élève
    const atRiskStudents = [];
    const notifications = [];

    for (const [studentId, scores] of studentScores) {
      if (scores.length < 2) continue; // Need at least 2 scores to detect trend

      // Calculer la moyenne et la tendance
      const recentScores = scores.slice(-5); // 5 dernières notes
      const avgRecent = recentScores.reduce((sum, s) => sum + s.score, 0) / recentScores.length;
      
      // Calculer la tendance (pente)
      let trend = 0;
      if (recentScores.length >= 3) {
        const firstThree = recentScores.slice(0, 3);
        const lastThree = recentScores.slice(-3);
        const avgFirst = firstThree.reduce((sum, s) => sum + s.score, 0) / firstThree.length;
        const avgLast = lastThree.reduce((sum, s) => sum + s.score, 0) / lastThree.length;
        trend = avgLast - avgFirst;
      }

      // Déterminer le niveau de risque
      let riskLevel = 'none';
      let riskReasons = [];

      if (avgRecent < 50) {
        riskLevel = 'critical';
        riskReasons.push(`Moyenne très faible: ${avgRecent.toFixed(1)}%`);
      } else if (avgRecent < 60) {
        riskLevel = 'high';
        riskReasons.push(`Moyenne faible: ${avgRecent.toFixed(1)}%`);
      }

      if (trend < -10) {
        if (riskLevel === 'none') riskLevel = 'medium';
        riskReasons.push(`Baisse significative: ${trend.toFixed(1)}%`);
      } else if (trend < -5) {
        if (riskLevel === 'none') riskLevel = 'low';
        riskReasons.push(`Tendance à la baisse: ${trend.toFixed(1)}%`);
      }

      if (riskLevel !== 'none') {
        const studentData = scores[0];
        atRiskStudents.push({
          student_id: studentId,
          student_name: studentData.student_name,
          classroom_name: studentData.classroom_name,
          risk_level: riskLevel,
          average_score: avgRecent,
          trend: trend,
          reasons: riskReasons
        });

        // Récupérer les enseignants et admins de l'ÉCOLE DE L'ÉLÈVE uniquement
        const { data: teachers } = await supabase
          .from('teachers')
          .select('user_id')
          .eq('school_id', callerSchoolId);

        // Admins of the same school: join via profiles
        const { data: schoolAdminProfiles } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('school_id', callerSchoolId);
        const schoolUserIds = (schoolAdminProfiles || []).map(p => p.user_id);
        const { data: admins } = schoolUserIds.length
          ? await supabase
              .from('user_roles')
              .select('user_id')
              .eq('role', 'admin')
              .in('user_id', schoolUserIds)
          : { data: [] as { user_id: string }[] };

        // Créer des notifications
        const recipientIds = new Set([
          ...(teachers?.map(t => t.user_id) || []),
          ...(admins?.map(a => a.user_id) || [])
        ]);

        for (const userId of recipientIds) {
          const severity = riskLevel === 'critical' ? '🔴' : riskLevel === 'high' ? '🟠' : '🟡';
          notifications.push({
            user_id: userId,
            type: 'alert',
            title: `${severity} Élève à risque: ${studentData.student_name}`,
            message: `${studentData.student_name} (${studentData.classroom_name}) nécessite une attention particulière. ${riskReasons.join('. ')}.`,
            action_url: `/students`,
            read: false
          });
        }
      }
    }


    // Insérer les notifications
    if (notifications.length > 0) {
      const { error: notifError } = await supabase
        .from('notifications')
        .insert(notifications);

      if (notifError) {
        console.error('Error creating notifications:', notifError);
      } else {
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        at_risk_students: atRiskStudents,
        notifications_created: notifications.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error in detect-at-risk-students:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
