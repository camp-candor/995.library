import { z } from 'zod';

export const ExampleSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.date(),
  data: z.string(),
});

export type ExampleType = z.infer<typeof ExampleSchema>;

export interface HealthCheck {
  status: 'ALIVE' | 'DEAD';
  tick: number;
}

export * from './game.js';
