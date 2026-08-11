import { runOrchestrator } from './orchestrator.js';

const situationInput = document.getElementById('situation-input');
const runButton = document.getElementById('run-agents-button');
const clearButton = document.getElementById('clear-results-button');
const tracePanel = document.getElementById('workflow-trace');
const tryExampleButton = document.getElementById('try-example-button');
const resetButton = document.getElementById('reset-button');

const agentConfig = {
  planner: {
    toggle: document.getElementById('planner-toggle'),
    controlCard: document.getElementById('planner-toggle')?.closest('.agent-card'),
    resultCard: document.getElementById('planner-result-card'),
    resultOutput: document.getElementById('planner-result'),
  },
  time: {
    toggle: document.getElementById('time-toggle'),
    controlCard: document.getElementById('time-toggle')?.closest('.agent-card'),
    resultCard: document.getElementById('time-result-card'),
    resultOutput: document.getElementById('time-result'),
  },
  priority: {
    toggle: document.getElementById('priority-toggle'),
    controlCard: document.getElementById('priority-toggle')?.closest('.agent-card'),
    resultCard: document.getElementById('priority-result-card'),
    resultOutput: document.getElementById('priority-result'),
  },
  checklist: {
    toggle: document.getElementById('checklist-toggle'),
    controlCard: document.getElementById('checklist-toggle')?.closest('.agent-card'),
    resultCard: document.getElementById('checklist-result-card'),
    resultOutput: document.getElementById('checklist-result'),
  },
};

const enabledAgents = {
  planner: true,
  time: true,
  priority: true,
  checklist: true,
};

let currentAgentKey = null;
const buttonText = runButton.textContent;
let traceStep = 0;

function setAgentCardVisual(agentKey, state) {
  const config = agentConfig[agentKey];
  if (!config || !config.controlCard) return;

  config.controlCard.classList.remove('agent-running', 'agent-complete', 'agent-off', 'agent-on', 'error');

  let statusLabel = 'ON';
  if (state === 'running') {
    config.controlCard.classList.add('agent-running', 'agent-on');
    statusLabel = 'RUNNING';
  } else if (state === 'complete') {
    config.controlCard.classList.add('agent-complete', 'agent-on');
    statusLabel = 'COMPLETE';
  } else if (state === 'off') {
    config.controlCard.classList.add('agent-off');
    statusLabel = 'OFF';
  } else if (state === 'error') {
    config.controlCard.classList.add('error');
    statusLabel = 'ERROR';
  } else {
    config.controlCard.classList.add('agent-on');
    statusLabel = 'ON';
  }

  config.controlCard.dataset.status = statusLabel;
}

function updateToggleState(agentKey) {
  const config = agentConfig[agentKey];
  if (!config) return;

  enabledAgents[agentKey] = config.toggle.checked;
  setAgentCardVisual(agentKey, enabledAgents[agentKey] ? 'on' : 'off');
}

function clearResults() {
  Object.keys(agentConfig).forEach((agentKey) => {
    const config = agentConfig[agentKey];
    if (!config) return;
    config.resultOutput.textContent = '';
    config.resultCard.classList.remove('error');
    setAgentCardVisual(agentKey, enabledAgents[agentKey] ? 'on' : 'off');
  });

  while (tracePanel.firstChild) {
    tracePanel.removeChild(tracePanel.firstChild);
  }
  traceStep = 0;
}

function resetWorkflow() {
  // Turn all agent toggles ON and clear their outputs and visual states
  Object.keys(agentConfig).forEach((agentKey) => {
    const config = agentConfig[agentKey];
    if (!config) return;
    if (config.toggle) {
      config.toggle.checked = true;
    }
    enabledAgents[agentKey] = true;
    setAgentCardVisual(agentKey, 'on');
    if (config.resultOutput) config.resultOutput.textContent = '';
    if (config.resultCard) config.resultCard.classList.remove('error');
  });

  // Clear trace and reset step counter
  while (tracePanel.firstChild) tracePanel.removeChild(tracePanel.firstChild);
  traceStep = 0;

  // Clear the main input textarea
  if (situationInput) situationInput.value = '';

  // Ensure run button is enabled and not loading
  setButtonLoading(false);
  runButton.disabled = false;

  createTraceItem('Workflow reset: all agents ON and outputs cleared');
}

function createTraceItem(message, isError = false) {
  traceStep += 1;

  const item = document.createElement('div');
  item.className = 'trace-item';
  if (isError) item.classList.add('error');

  const stepEl = document.createElement('div');
  stepEl.className = 'trace-step';
  stepEl.textContent = String(traceStep);

  const contentEl = document.createElement('div');
  contentEl.className = 'trace-content';

  // simple parser to turn trace strings into an educational timeline entry
  let titleText = message;
  let subText = '';
  let emoji = '';

  if (/Orchestrator/i.test(message)) {
    emoji = '🎬';
    titleText = 'Orchestrator';
    if (/started/i.test(message)) subText = 'Workflow started';
    else if (/finished/i.test(message)) subText = 'Workflow finished';
    else subText = message;
  } else if (/Agent/i.test(message)) {
    const m = message.match(/^(.*?) Agent/i);
    const label = m ? `${m[1]} Agent` : 'Agent';
    const key = m ? m[1].split(' ')[0].toLowerCase() : '';
    const icons = { planner: '🤖', time: '⏰', priority: '🎯', checklist: '✅' };
    emoji = icons[key] || '🤖';
    titleText = `${emoji} ${label}`;

    if (/started/i.test(message)) subText = 'Started';
    else if (/completed/i.test(message)) subText = 'Completed';
    else if (/OFF/i.test(message) && /skipped/i.test(message)) subText = 'Skipped because it is OFF';
    else if (/is ON/i.test(message)) subText = 'Enabled';
    else subText = message.replace(new RegExp(`${label}\s*`,'i'), '').trim();
  } else if (/^Error:/i.test(message)) {
    emoji = '⚠️';
    titleText = `${emoji} Error`;
    subText = message.replace(/^Error:\s*/i, '');
    item.classList.add('error');
  } else {
    // fallback — show raw message
    titleText = message;
  }

  const titleDiv = document.createElement('div');
  titleDiv.className = 'trace-title';
  titleDiv.textContent = titleText;

  const subDiv = document.createElement('div');
  subDiv.className = 'trace-subtext';
  subDiv.textContent = subText;

  contentEl.appendChild(titleDiv);
  if (subText) contentEl.appendChild(subDiv);

  item.appendChild(stepEl);
  item.appendChild(contentEl);

  tracePanel.appendChild(item);
  tracePanel.scrollTop = tracePanel.scrollHeight;
}

function setButtonLoading(isLoading) {
  runButton.disabled = isLoading;
  runButton.classList.toggle('loading', isLoading);
  runButton.textContent = isLoading ? 'Running…' : buttonText;
}

function initializeToggles() {
  Object.keys(agentConfig).forEach((agentKey) => {
    const config = agentConfig[agentKey];
    if (!config || !config.toggle) return;
    enabledAgents[agentKey] = config.toggle.checked;
    setAgentCardVisual(agentKey, enabledAgents[agentKey] ? 'on' : 'off');

    config.toggle.addEventListener('change', () => {
      updateToggleState(agentKey);
    });
  });
}

async function handleRun() {
  const userMessage = situationInput.value.trim();
  if (!userMessage) {
    createTraceItem('Please enter your situation before running agents.', true);
    return;
  }

  clearResults();
  // If no agents are enabled, show message and stop without calling the API
  const anyEnabled = Object.values(enabledAgents).some(Boolean);
  if (!anyEnabled) {
    createTraceItem('No agents are currently ON. Turn on at least one agent to run the workflow.', true);
    createTraceItem('Workflow stopped: no agents enabled.');
    // Ensure the Run button remains enabled
    setButtonLoading(false);
    return;
  }

  setButtonLoading(true);
  createTraceItem('Starting orchestrator...');

  const orchestratorPayload = {
    userMessage,
    enabledAgents,
    onAgentStart(agentName) {
      currentAgentKey = agentName;
      setAgentCardVisual(agentName, 'running');
      createTraceItem(`${agentName.replace(/^[a-z]/, (c) => c.toUpperCase())} Agent started`);
    },
    onAgentComplete(agentName, output) {
      const config = agentConfig[agentName];
      if (config) {
        config.resultOutput.textContent = output || '';
        setAgentCardVisual(agentName, 'complete');
      }
      createTraceItem(`${agentName.replace(/^[a-z]/, (c) => c.toUpperCase())} Agent completed`);
    },
    onTrace(message) {
      createTraceItem(message);
    },
    onError(error) {
      const message = error instanceof Error ? error.message : String(error);
      createTraceItem(`Error: ${message}`, true);
      if (currentAgentKey) {
        setAgentCardVisual(currentAgentKey, 'error');
        const config = agentConfig[currentAgentKey];
        if (config) {
          config.resultOutput.textContent = `Error: ${message}`;
          config.resultCard.classList.add('error');
        }
      }
    },
  };

  const { trace } = await runOrchestrator(orchestratorPayload);

  trace.forEach((message) => {
    // already rendered through onTrace and onAgent callbacks
  });

  setButtonLoading(false);
}

function initializeApp() {
  initializeToggles();
  runButton.addEventListener('click', handleRun);
  if (tryExampleButton) {
    const examples = [
      "I have school tomorrow, soccer practice at 5 PM, a science test Friday, and I need to clean my room.",
      "I have three homework assignments due this week, I need to prepare for a presentation, and I also want some free time.",
      "This weekend I need to clean my room, finish a book, help with chores, and prepare for Monday.",
      "I have several things to do after school and I keep forgetting what needs to happen first.",
    ];

    tryExampleButton.addEventListener('click', () => {
      const idx = Math.floor(Math.random() * examples.length);
      situationInput.value = examples[idx];
      situationInput.focus();
      // do not auto-run — user must click Run Agents
      createTraceItem('Inserted example into input (agents not run)');
    });
  }
  if (resetButton) resetButton.addEventListener('click', resetWorkflow);
  clearButton.addEventListener('click', clearResults);
}

initializeApp();
