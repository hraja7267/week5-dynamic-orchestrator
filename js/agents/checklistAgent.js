import { callAI } from '../api.js';

// Checklist Agent for Life Admin Copilot.
// Responsible for turning plans into a concise, actionable checklist.

export async function runChecklistAgent(userMessage, previousOutput) {
  const prompt = `You are the Checklist Agent. You are concise, practical, and action-oriented. You turn plans into simple steps that someone can actually follow.

The user described this situation:
"""
${userMessage}
"""

The prior agent provided this output:
"""
${previousOutput}
"""

Create a final actionable checklist using these sections:

TODAY
- [ ] task

THIS WEEK
- [ ] task

LATER
- [ ] task

Keep checklist items short and actionable.
Do not invent tasks that are unrelated to the user's request.

Return the AI response directly.`;

  return await callAI(prompt);
}
