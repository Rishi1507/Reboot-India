import { z } from 'zod';
import { insertTrekSchema, insertBlogSchema, treks, blogs } from './schema';

// API contract is defined here for consistency, though this app uses static data.

export const api = {
  treks: {
    list: {
      method: 'GET' as const,
      path: '/api/treks',
      responses: {
        200: z.array(z.custom<typeof treks.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/treks/:slug',
      responses: {
        200: z.custom<typeof treks.$inferSelect>(),
        404: z.object({ message: z.string() }),
      },
    },
  },
  blogs: {
    list: {
      method: 'GET' as const,
      path: '/api/blogs',
      responses: {
        200: z.array(z.custom<typeof blogs.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/blogs/:slug',
      responses: {
        200: z.custom<typeof blogs.$inferSelect>(),
        404: z.object({ message: z.string() }),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
