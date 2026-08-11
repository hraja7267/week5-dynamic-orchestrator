# Life Admin Copilot

## Project Overview

Life Admin Copilot is a small, educational multi-agent AI system that helps students manage everyday tasks. The app demonstrates how an orchestrator dynamically composes and executes a pipeline of specialized agents to turn a plain user description into a plan, schedule, priorities, and a checklist.

The UI is a three-panel command center: Agent controls (left), Agent results (middle), and the Orchestrator trace (right). It is designed to be clear and approachable for students learning about orchestration and agent-based systems.

## How It Works

User
↓
Orchestrator
↓
Dynamic Agent Selection
↓
Specialized Agents
↓
Agent-to-Agent Information Passing
↓
Results
↓
Workflow Trace

The user types a short description of their situation. The orchestrator inspects which agents are turned ON, builds an ordered pipeline, runs the enabled agents sequentially, and passes the previous agent's output to the next. All major events are written to the Workflow Trace so students can follow what happened.

## The Agents

Each agent is implemented in its own file under `js/agents/` and is responsible for a single concern.

### Planner Agent

Transforms the user's messy situation into a structured plan: identifies important tasks, breaks large tasks down, and outlines a reasonable step-by-step plan.

### Time Agent

Analyzes timing: looks for scheduling conflicts, suggests reasonable time blocks when possible, and recommends opportunities to group tasks to save time.

### Priority Agent

Helps decide what matters first by categorizing tasks (DO FIRST / DO NEXT / DO LATER / OPTIONAL) and briefly explaining why.

### Checklist Agent

Turns the final plan into an actionable checklist separated into TODAY / THIS WEEK / LATER items.

## The Orchestrator

The orchestrator coordinates the workflow. Its responsibilities:

- Check which agents are ON.
- Build the active workflow (ordered pipeline) from the agent registry.
- Run enabled agents in order.
- Skip agents that are OFF.
- Pass the previous agent's output to the next agent as input.
- Record workflow events (started, completed, skipped, errors) in the right-hand trace panel.

This dynamic composition demonstrates how an orchestrator can determine which components participate at runtime.

## Dynamic Agents (Examples)

All ON:
Planner → Time → Priority → Checklist

Time OFF:
Planner → Priority → Checklist

Only Priority ON:
Priority

These different configurations show how the orchestrator adapts the pipeline without code changes.

## Three-Panel Interface

- Left = Agent Controls — toggle agents ON/OFF and see their visual state.
- Middle = Agent Results — each agent writes its output here.
- Right = Workflow Trace — a numbered, emoji-enhanced timeline of what the orchestrator did.

## Technologies

- HTML
- CSS (no framework)
- JavaScript (ES Modules)
- Fetch API
- LLM API (via the provided endpoint)

## API

This project communicates with the course-provided LLM endpoint. The repository does not include any API authorization tokens. To run the app you must configure an API key at runtime.

Do NOT commit your API token to the repository or publish it in public forks.

To configure the key locally for testing, create a file named `config.js` (not checked in) with the following content and include it in `index.html` before the main module script, for example:

```html
<!-- Example: config.js should be gitignored and NOT pushed with your token -->
<script>
	// DO NOT commit this file. Replace with your key in local testing only.
	window.VIBE_API_KEY = 'YOUR_API_KEY_HERE';
	// Optional: override endpoint
	// window.VIBE_API_ENDPOINT = 'https://your-proxy.example.com/v1/chat/completions';
</script>
<!-- then the module script -->
<script type="module" src="js/app.js"></script>
```

If you prefer a secure approach for public GitHub Pages, host a small server-side proxy that injects the token server-side and call that HTTPS endpoint from the client.

## How to Run

Locally (simple static server, required for ES modules):

```bash
# from the project root
python3 -m http.server 8000
# then open http://localhost:8000 in your browser
```

Or using Node (if you have `http-server`):

```bash
npx http-server -c-1 . -p 8000
# open http://localhost:8000
```

GitHub Pages:

1. Commit and push the repository to GitHub.
2. In the repository settings enable GitHub Pages (use `main` branch or `docs/` folder as desired).
3. If your app needs the API key at runtime, configure a secure injection method (such as a server-side proxy) — do not commit the key.

Note: ES module imports require serving the files over HTTP (file:// will not work reliably in modern browsers).

## Week 5 Learning Goals

This assignment demonstrates and exercises the following concepts:

- Orchestration: a central controller builds and runs an execution plan.
- Dynamic agent selection: the orchestrator decides which agents to run based on runtime toggles.
- Agent specialization: each agent has a single responsibility and lives in its own module.
- Sequential execution: the orchestrator runs agents in order and passes outputs forward.
- Information passing: agents receive the previous agent's output as an input argument.
- Workflow tracing: all major events (start, complete, skip, errors) are recorded in the UI trace for teaching and debugging.

## Reflection

Working on this project clarified how orchestration separates control logic from specialized behavior. Instead of hardcoding workflows, the orchestrator inspects an ordered registry and composes an active pipeline. That makes the system easy to extend (add a new agent file and register it) and simple to reason about. The right-hand Workflow Trace proved invaluable when teaching — students can see each step and understand how information flows between agents.

The exercise reinforced the importance of separation of concerns: agents keep their prompts and logic localized, `api.js` centralizes communication with the LLM endpoint, `orchestrator.js` handles control flow, and `app.js` manages the UI. Removing hardcoded secrets and requiring runtime configuration is a practical safety step for public demos.

---

If you want, I can add a short development section with a `.gitignore` recommendation and an example `config.example.js` file to make local testing simpler and safer.
