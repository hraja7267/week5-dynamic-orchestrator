import { runPlannerAgent } from './agents/plannerAgent.js';
import { runTimeAgent } from './agents/timeAgent.js';
import { runPriorityAgent } from './agents/priorityAgent.js';
import { runChecklistAgent } from './agents/checklistAgent.js';

// Ordered agent registry — easy to extend with new agents
const agentRegistry = [
  { id: 'planner', name: 'Planner Agent', run: runPlannerAgent },
  { id: 'time', name: 'Time Agent', run: runTimeAgent },
  { id: 'priority', name: 'Priority Agent', run: runPriorityAgent },
  { id: 'checklist', name: 'Checklist Agent', run: runChecklistAgent },
];

export async function runOrchestrator({
  userMessage,
  enabledAgents,
  onAgentStart,
  onAgentComplete,
  onTrace,
  onError,
}) {
  const trace = [];
  const results = {};
  let previousOutput = null;

  const safeTrace = (message) => {
    trace.push(message);
    if (typeof onTrace === 'function') {
      onTrace(message);
    }
  };

  const safeAgentStart = (agentName) => {
    if (typeof onAgentStart === 'function') {
      onAgentStart(agentName);
    }
  };

  const safeAgentComplete = (agentName, output) => {
    if (typeof onAgentComplete === 'function') {
      onAgentComplete(agentName, output);
    }
  };

  const safeError = (error) => {
    if (typeof onError === 'function') {
      onError(error);
    }
  };

  safeTrace('Orchestrator started');

  try {
    // Build the pipeline by filtering the ordered registry based on enabledAgents
    const pipeline = [];
    for (const agent of agentRegistry) {
      const isEnabled = enabledAgents?.[agent.id] ?? false;
      if (!isEnabled) {
        safeTrace(`${agent.name} is OFF — skipped`);
      } else {
        safeTrace(`${agent.name} is ON`);
        pipeline.push(agent);
      }
    }

    // Execute the filtered pipeline sequentially
    for (const agent of pipeline) {
      safeAgentStart(agent.id);
      safeTrace(`${agent.name} started`);

      const inputArgs = previousOutput === null
        ? [userMessage]
        : [userMessage, previousOutput];

      const output = await agent.run(...inputArgs);

      results[agent.id] = output;
      previousOutput = output;

      safeAgentComplete(agent.id, output);
      safeTrace(`${agent.name} completed`);
    }

    safeTrace('Orchestrator finished');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    safeTrace(`Error: ${message}`);
    safeError(error);
  }

  return { results, trace };
}
