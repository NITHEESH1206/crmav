/**
 * The latest connector version the cloud expects. Bump this whenever
 * agent/zynex-agent.mjs changes meaningfully. The poll endpoint returns it so
 * older connectors can self-update via `node zynex-agent.mjs --update`.
 */
export const LATEST_AGENT_VERSION = "2.0.0";
