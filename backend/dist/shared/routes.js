import { z } from 'zod';
// API contract is defined here for consistency, though this app uses static data.
export const api = {
    treks: {
        list: {
            method: 'GET',
            path: '/api/treks',
            responses: {
                200: z.array(z.custom()),
            },
        },
        get: {
            method: 'GET',
            path: '/api/treks/:slug',
            responses: {
                200: z.custom(),
                404: z.object({ message: z.string() }),
            },
        },
    },
    blogs: {
        list: {
            method: 'GET',
            path: '/api/blogs',
            responses: {
                200: z.array(z.custom()),
            },
        },
        get: {
            method: 'GET',
            path: '/api/blogs/:slug',
            responses: {
                200: z.custom(),
                404: z.object({ message: z.string() }),
            },
        },
    },
};
export function buildUrl(path, params) {
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
