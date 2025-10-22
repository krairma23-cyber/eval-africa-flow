/**
 * Utility functions for calculating student rankings
 */

export interface StudentRanking {
  student_id: string;
  average: number;
  rank: number;
}

/**
 * Calculate rankings for students based on their averages
 * Students with the same average get the same rank
 * @param students Array of students with their averages
 * @returns Array of students with calculated ranks
 */
export function calculateRankings(
  students: Array<{ student_id: string; average: number }>
): StudentRanking[] {
  // Sort students by average in descending order
  const sortedStudents = [...students].sort((a, b) => b.average - a.average);
  
  const rankings: StudentRanking[] = [];
  let currentRank = 1;
  let previousAverage: number | null = null;
  let studentsWithSameRank = 0;

  sortedStudents.forEach((student, index) => {
    // If this student has the same average as the previous one, give them the same rank
    if (previousAverage !== null && Math.abs(student.average - previousAverage) < 0.01) {
      rankings.push({
        student_id: student.student_id,
        average: student.average,
        rank: currentRank,
      });
      studentsWithSameRank++;
    } else {
      // New average, so new rank (skip ranks if there were ties)
      currentRank = index + 1;
      rankings.push({
        student_id: student.student_id,
        average: student.average,
        rank: currentRank,
      });
      studentsWithSameRank = 0;
    }
    
    previousAverage = student.average;
  });

  return rankings;
}

/**
 * Get the rank for a specific student
 */
export function getStudentRank(
  studentId: string,
  allStudents: Array<{ student_id: string; average: number }>
): { rank: number; total: number } {
  const rankings = calculateRankings(allStudents);
  const studentRanking = rankings.find(r => r.student_id === studentId);
  
  return {
    rank: studentRanking?.rank || 0,
    total: rankings.length,
  };
}
