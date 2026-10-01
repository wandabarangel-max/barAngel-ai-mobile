import type { Agent, Task } from './types.js';

export function evaluateTaskRequest(task: Task, agent: Agent) {
  const blockedSystems = ['unsupported', 'forbidden', 'external-risk'];

  const allowedTypes = ['general', 'coding', 'research', 'marketing', 'social'];

  if (blockedSystems.includes(String(task.type))) {
    return {
      allowed: false,
      reason: 'The requested task type is not supported by the current platform policy.',
      suggestion: 'Try a safer, supported task type or reframe the task into a more general request.'
    };
  }

  if (!allowedTypes.includes(String(task.type)) && agent.type !== 'general') {
    return {
      allowed: false,
      reason: 'This task type does not match the selected agent capabilities.',
      suggestion: 'Assign a more suitable agent or normalize the task into a supported capability.'
    };
  }

  if (task.priority === 'urgent' && agent.type !== 'general') {
    return {
      allowed: false,
      reason: 'Urgent tasks require a general or escalation-capable agent.',
      suggestion: 'Retry with a general agent or create a delegated workflow.'
    };
  }

  return {
    allowed: true,
    reason: 'Task policy accepted this request.',
    suggestion: 'Task execution was attempted and routed to the best available agent.'
  };
}
