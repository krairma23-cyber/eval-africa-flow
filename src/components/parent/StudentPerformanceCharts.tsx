import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from "recharts";
import { TrendingUp, Award, BookOpen, Target } from "lucide-react";

interface SubjectGrade {
  subject_name: string;
  avg_score: number;
  coefficient: number;
  weighted_score: number;
}

interface StudentReport {
  id: string;
  student_id: string;
  student_name: string;
  class_name: string;
  term: string;
  term_id: string;
  average: number;
  rank: number;
  total_students: number;
  date: string;
  subject_grades: SubjectGrade[];
  classroom_id?: string;
}

interface StudentPerformanceChartsProps {
  reports: StudentReport[];
}

export function StudentPerformanceCharts({ reports }: StudentPerformanceChartsProps) {
  if (!reports || reports.length === 0) {
    return null;
  }

  // Get unique students from reports
  const studentReports: { [key: string]: StudentReport[] } = {};
  reports.forEach(report => {
    if (!studentReports[report.student_id]) {
      studentReports[report.student_id] = [];
    }
    studentReports[report.student_id].push(report);
  });

  // Prepare data for evolution chart (averages over terms)
  const getEvolutionData = (studentId: string) => {
    const studentData = studentReports[studentId] || [];
    return studentData
      .filter(r => r.average > 0)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(r => ({
        term: r.term,
        average: parseFloat(r.average.toFixed(2)),
        rank: r.rank,
        total: r.total_students
      }));
  };

  // Prepare subject performance data (radar chart)
  const getSubjectData = (studentId: string) => {
    const studentData = studentReports[studentId] || [];
    const latestReport = studentData.find(r => r.subject_grades && r.subject_grades.length > 0);
    
    if (!latestReport) return [];
    
    return latestReport.subject_grades.map(s => ({
      subject: s.subject_name.length > 10 ? s.subject_name.substring(0, 10) + '...' : s.subject_name,
      fullName: s.subject_name,
      score: parseFloat(s.avg_score.toFixed(2)),
      maxScore: 20
    }));
  };

  // Prepare ranking evolution data
  const getRankingData = (studentId: string) => {
    const studentData = studentReports[studentId] || [];
    return studentData
      .filter(r => r.rank > 0)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(r => ({
        term: r.term,
        rank: r.rank,
        percentile: parseFloat(((1 - (r.rank - 1) / r.total_students) * 100).toFixed(1))
      }));
  };

  // Calculate statistics
  const getStats = (studentId: string) => {
    const studentData = studentReports[studentId] || [];
    const validReports = studentData.filter(r => r.average > 0);
    
    if (validReports.length === 0) {
      return { bestAverage: 0, trend: 0, avgRank: 0, bestSubject: 'N/A' };
    }

    const bestAverage = Math.max(...validReports.map(r => r.average));
    
    // Calculate trend (difference between last and first average)
    const sortedByDate = [...validReports].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const trend = sortedByDate.length >= 2 
      ? sortedByDate[sortedByDate.length - 1].average - sortedByDate[0].average 
      : 0;
    
    // Average rank
    const avgRank = validReports.reduce((sum, r) => sum + r.rank, 0) / validReports.length;
    
    // Best subject
    const latestWithGrades = validReports.find(r => r.subject_grades && r.subject_grades.length > 0);
    const bestSubject = latestWithGrades?.subject_grades?.reduce((best, current) => 
      current.avg_score > best.avg_score ? current : best
    )?.subject_name || 'N/A';

    return { bestAverage, trend, avgRank, bestSubject };
  };

  const firstStudentId = Object.keys(studentReports)[0];
  const evolutionData = getEvolutionData(firstStudentId);
  const subjectData = getSubjectData(firstStudentId);
  const rankingData = getRankingData(firstStudentId);
  const stats = getStats(firstStudentId);

  if (evolutionData.length === 0 && subjectData.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <TrendingUp className="h-6 w-6 text-primary" />
        Analyse des Performances
      </h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Award className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Meilleure Moyenne</p>
              <p className="text-xl font-bold">{stats.bestAverage.toFixed(2)}/20</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${stats.trend >= 0 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
              <TrendingUp className={`h-5 w-5 ${stats.trend >= 0 ? 'text-green-600' : 'text-red-600 rotate-180'}`} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Évolution</p>
              <p className={`text-xl font-bold ${stats.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.trend >= 0 ? '+' : ''}{stats.trend.toFixed(2)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Target className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Rang Moyen</p>
              <p className="text-xl font-bold">{stats.avgRank.toFixed(0)}e</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <BookOpen className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Meilleure Matière</p>
              <p className="text-sm font-bold truncate">{stats.bestSubject}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Average Evolution Chart */}
        {evolutionData.length > 0 && (
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Évolution des Moyennes</h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={evolutionData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="term" 
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <YAxis 
                    domain={[0, 20]} 
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [`${value}/20`, 'Moyenne']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="average" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 8 }}
                  />
                  {/* Reference line at 10 */}
                  <Line 
                    type="monotone" 
                    dataKey={() => 10} 
                    stroke="hsl(var(--muted-foreground))" 
                    strokeDasharray="5 5"
                    strokeWidth={1}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}

        {/* Subject Performance Radar */}
        {subjectData.length > 0 && (
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Performance par Matière</h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={subjectData} cx="50%" cy="50%" outerRadius="70%">
                  <PolarGrid className="stroke-muted" />
                  <PolarAngleAxis 
                    dataKey="subject" 
                    tick={{ fontSize: 10 }}
                    className="text-muted-foreground"
                  />
                  <PolarRadiusAxis 
                    angle={30} 
                    domain={[0, 20]}
                    tick={{ fontSize: 10 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number, name: string, props: any) => [
                      `${value}/20`, 
                      props.payload.fullName || name
                    ]}
                  />
                  <Radar 
                    name="Note" 
                    dataKey="score" 
                    stroke="hsl(var(--primary))" 
                    fill="hsl(var(--primary))" 
                    fillOpacity={0.4}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}

        {/* Subject Bar Chart */}
        {subjectData.length > 0 && (
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Notes par Matière</h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    type="number" 
                    domain={[0, 20]}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="subject" 
                    tick={{ fontSize: 10 }}
                    width={80}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number, name: string, props: any) => [
                      `${value}/20`, 
                      props.payload.fullName || 'Note'
                    ]}
                  />
                  <Bar 
                    dataKey="score" 
                    fill="hsl(var(--primary))"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}

        {/* Ranking Evolution */}
        {rankingData.length > 1 && (
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Évolution du Classement</h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={rankingData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="term" 
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    domain={['auto', 'auto']}
                    reversed
                    tick={{ fontSize: 12 }}
                    label={{ 
                      value: 'Rang', 
                      angle: -90, 
                      position: 'insideLeft',
                      style: { fontSize: 12 }
                    }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number, name: string) => {
                      if (name === 'rank') return [`${value}e`, 'Rang'];
                      return [`${value}%`, 'Percentile'];
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="rank" 
                    name="Rang"
                    stroke="hsl(var(--accent))" 
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--accent))', strokeWidth: 2, r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
