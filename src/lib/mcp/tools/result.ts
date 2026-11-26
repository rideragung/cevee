export interface ToolTextResult {
  [key: string]: unknown;
  content: Array<{ type: 'text'; text: string }>;
  isError?: boolean;
}

export const jsonResult = (data: unknown): ToolTextResult => ({
  content: [
    {
      type: 'text',
      text: JSON.stringify(data, null, 2),
    },
  ],
});

export const errorResult = (message: string, details?: unknown): ToolTextResult => ({
  content: [
    {
      type: 'text',
      text: JSON.stringify(
        {
          error: message,
          ...(details !== undefined ? { details } : {}),
        },
        null,
        2
      ),
    },
  ],
  isError: true,
});
