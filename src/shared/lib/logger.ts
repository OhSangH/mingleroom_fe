type LogPayload = unknown[];

export const logger = {
  info: (...args: LogPayload) => console.info('[MingleRoom]', ...args),
  warn: (...args: LogPayload) => console.warn('[MingleRoom]', ...args),
  error: (...args: LogPayload) => console.error('[MingleRoom]', ...args),
};
