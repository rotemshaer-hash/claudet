export type ChatTurn = { role: "user" | "model"; text: string };
export const MAX_INPUT = 4000,
  MAX_CONTEXT = 16000,
  MAX_TURNS = 12,
  MAX_BODY = 80000;
