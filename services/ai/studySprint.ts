import { Type } from "@google/genai";
import { CourseType, StudySprintTask, StudySprintState, StudySprintReportData, Question } from "../../types";
import { callAI, cleanJsonResponse, getCourseContext, DEFAULT_MODEL } from "./core";

// ============================================================================
// STUDY SPRINT FUNCTIONS
// ============================================================================

/**
 * Generate AI-recommended task sequence for Study Sprint
 */
export const getStudySprintTaskRecommendations = async (
  course: CourseType,
  gradeLevel: string,
  units: string,
  topics: string,
  taskCount: number = 3,
  subtopicFocus: string = ''
): Promise<StudySprintTask[]> => {
  try {
    const focusContext = subtopicFocus
      ? `**Subtopic Focus**: ${subtopicFocus}\n`
      : '';

    const prompt = `You are designing a comprehensive Study Sprint review session for a ${gradeLevel} ${course} student.

**Topic Focus**: ${topics}
**Units Covered**: ${units}
${focusContext}
Create exactly ${taskCount} diverse, complementary review tasks that provide a comprehensive practice experience:

**Task Selection Strategy**:
1. **Variety**: Include assessment, review, and application tasks
2. **Progression**: Mix quick recall with deeper thinking
3. **Format Diversity**: Ensure different interaction types (selection, short answer, long-form, problem-solving)

**Available Task Types**:
- **quiz**: 5-8 multiple choice and short answer questions (good for quick assessment)
- **frq**: 1-2 Free Response Questions with scenarios/data (good for application and explanation)
- **cer**: Claim-Evidence-Reasoning data analysis task (good for scientific reasoning)
- **worksheet**: Mixed practice with various question types (good for comprehensive review)
- **calculation**: Step-by-step problem solving practice (good for math/physics problems, stoichiometry, quantitative analysis)

**Recommended Combinations**:
- AP/Honors (3 tasks): FRQ + Quiz + CER
- AP/Honors (4-5 tasks): Add Calculation + Worksheet
- General (3 tasks): Quiz + Worksheet + CER
- General (4-5 tasks): Add FRQ or Calculation
- Math/Physics heavy: Prioritize Calculation tasks
- Data-heavy topics: Prioritize CER tasks
- Concept-heavy topics: Prioritize FRQ tasks

For each task, provide:
- **type**: One of the available task types
- **title**: Engaging, topic-specific title (e.g., "Quick Check: Photosynthesis", "Stoichiometry Practice", "Data Analysis: Cell Division Rates")
- **description**: 1-2 sentence preview of what student will practice (specific to the topic)

Return exactly ${taskCount} tasks in order of increasing cognitive demand.

Return as JSON:
{
  "tasks": [
    { "type": "quiz", "title": "...", "description": "..." },
    { "type": "frq", "title": "...", "description": "..." },
    { "type": "cer", "title": "...", "description": "..." }
  ]
}`;

    const response = await callAI(DEFAULT_MODEL, prompt, {
      temperature: 0.7,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          tasks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING },
                title: { type: Type.STRING },
                description: { type: Type.STRING }
              },
              required: ["type", "title", "description"]
            }
          }
        },
        required: ["tasks"]
      }
    });

    const cleanText = cleanJsonResponse(response.text || "");
    const result: { tasks: Pick<StudySprintTask, 'type' | 'title' | 'description'>[] } = JSON.parse(cleanText || "{\"tasks\": []}");

    // Transform to StudySprintTask format with IDs and status
    return result.tasks.slice(0, taskCount).map((task, idx) => ({
      id: `sprint-task-${Date.now()}-${idx}`,
      type: task.type,
      title: task.title,
      description: task.description,
      status: 'pending' as const,
      order: idx + 1
    }));

  } catch (err) {
    console.error("Task recommendation failed:", err);
    throw new Error("Failed to generate task recommendations. Please try again.");
  }
};

/**
 * Generate comprehensive study sprint report
 */
export const getStudySprintReport = async (
  state: StudySprintState
): Promise<StudySprintReportData> => {
  try {
    // Compile task data
    const taskSummaries = state.tasks.map(task => ({
      id: task.id,
      type: task.type,
      title: task.title,
      score: task.score || 'N/A',
      responsesCount: task.responses?.length || 0,
      correctCount: task.responses?.filter(r => r.evaluation === 'Correct').length || 0
    }));

    const prompt = `You are analyzing a student's Study Sprint session performance to provide holistic feedback.

**Course**: ${state.course} (${state.gradeLevel})
**Topic**: ${state.topics}
**Units**: ${state.units}
**Session Duration**: ${Math.round((Date.now() - state.sessionStartTime) / 60000)} minutes

**Tasks Completed**:
${taskSummaries.map((t, i) => `${i + 1}. ${t.title} (${t.type}): Score ${t.score}, ${t.correctCount}/${t.responsesCount} correct`).join('\n')}

Provide:

1. **summary**: 2-3 sentence overview of overall performance across all tasks
2. **taskAnalysis**: For each task, identify:
   - **taskId**: The task ID from the list above
   - **strengths**: 2-3 specific things the student did well
   - **improvements**: 1-2 specific areas to focus on for growth
3. **recommendations**: 3-5 actionable next steps for continued learning (be specific to the topics covered)

Be encouraging but honest. Focus on patterns across tasks, not just individual scores.

Return as JSON:
{
  "summary": "...",
  "taskAnalysis": [
    { "taskId": "...", "strengths": ["...", "..."], "improvements": ["...", "..."] }
  ],
  "recommendations": ["...", "...", "..."]
}`;

    const response = await callAI(DEFAULT_MODEL, prompt, {
      temperature: 0.6,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          taskAnalysis: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                taskId: { type: Type.STRING },
                strengths: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                improvements: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              },
              required: ["taskId", "strengths", "improvements"]
            }
          },
          recommendations: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["summary", "taskAnalysis", "recommendations"]
      }
    });

    const cleanText = cleanJsonResponse(response.text || "");
    const result = JSON.parse(cleanText || "{\"summary\": \"\", \"taskAnalysis\": [], \"recommendations\": []}");

    return result;

  } catch (err) {
    console.error("Study Sprint report generation failed:", err);
    throw new Error("Failed to generate report. Please try again.");
  }
};

/**
 * Generate bonus practice materials targeting weak areas
 */
export const generateBonusPractice = async (
  course: CourseType,
  topics: string,
  weakAreas: string[]
): Promise<{ questions: Question[]; answerKey: string[] }> => {
  try {
    const courseContext = getCourseContext(course);

    const weakAreasText = weakAreas.length > 0
      ? `Focus especially on these areas where the student needs more practice: ${weakAreas.join(', ')}`
      : '';

    const prompt = `${courseContext}

Generate 6 additional practice questions for continued learning on: ${topics}

${weakAreasText}

**Requirements**:
- Mix of 4 multiple choice (mcq) and 2 short answer (sa) questions
- Target areas where student needs reinforcement
- Clear, focused questions that build understanding
- For MCQ: Provide exactly 4 options (A-D) with distractors that address common misconceptions
- For SA: Questions should require 1-2 sentence responses

For each question:
- **text**: The question text
- **type**: "mcq" or "sa"
- **options**: Array of 4 options for MCQ (omit for SA)
- **correctAnswer**: The correct answer (option letter for MCQ, sample answer for SA)

Return as JSON:
{
  "questions": [
    { "text": "...", "type": "mcq", "options": ["A. ...", "B. ...", "C. ...", "D. ..."], "correctAnswer": "A" },
    { "text": "...", "type": "sa", "correctAnswer": "..." }
  ]
}`;

    const response = await callAI(DEFAULT_MODEL, prompt, {
      temperature: 0.7,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING },
                type: { type: Type.STRING },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                correctAnswer: { type: Type.STRING }
              },
              required: ["text", "type", "correctAnswer"]
            }
          }
        },
        required: ["questions"]
      }
    });

    const cleanText = cleanJsonResponse(response.text || "");
    const result: { questions: Pick<Question, 'text' | 'type' | 'options' | 'correctAnswer'>[] } = JSON.parse(cleanText || "{\"questions\": []}");

    // Transform to Question format
    const questions: Question[] = result.questions.map((q, idx) => ({
      id: `bonus-q-${Date.now()}-${idx}`,
      text: q.text,
      unit: topics,
      topic: topics,
      type: q.type,
      options: q.options || undefined,
      correctAnswer: q.correctAnswer
    }));

    // Build answer key
    const answerKey = questions.map((q, idx) => {
      if (q.type === 'mcq') {
        return `${idx + 1}. ${q.correctAnswer}`;
      } else {
        return `${idx + 1}. ${q.correctAnswer}`;
      }
    });

    return { questions, answerKey };

  } catch (err) {
    console.error("Bonus practice generation failed:", err);
    throw new Error("Failed to generate bonus practice. Please try again.");
  }
};
