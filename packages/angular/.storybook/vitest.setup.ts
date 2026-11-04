import { afterEach, beforeEach } from 'vitest';

// Angular reports a template that binds an unknown element or input with
// console.error and carries on rendering. Fail the story instead.
const consoleError = console.error;
let logged: string[] = [];

beforeEach(() => {
  logged = [];
  console.error = (...args: unknown[]) => {
    logged.push(args.map(String).join(' '));
    consoleError(...args);
  };
});

afterEach(() => {
  console.error = consoleError;
  if (logged.length === 0) return;
  throw new Error(`The story logged errors:\n${logged.join('\n\n')}`);
});
