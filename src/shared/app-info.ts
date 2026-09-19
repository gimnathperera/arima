import { z } from 'zod';

export const appInfoSchema = z.object({
  name: z.literal('Arima'),
  version: z.string().min(1),
  platform: z.string().min(1),
  arch: z.string().min(1),
});

export type AppInfo = z.infer<typeof appInfoSchema>;
