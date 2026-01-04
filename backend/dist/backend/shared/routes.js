"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
exports.buildUrl = buildUrl;
const zod_1 = require("zod");
// API contract is defined here for consistency, though this app uses static data.
exports.api = {
    treks: {
        list: {
            method: 'GET',
            path: '/api/treks',
            responses: {
                200: zod_1.z.array(zod_1.z.custom()),
            },
        },
        get: {
            method: 'GET',
            path: '/api/treks/:slug',
            responses: {
                200: zod_1.z.custom(),
                404: zod_1.z.object({ message: zod_1.z.string() }),
            },
        },
    },
    blogs: {
        list: {
            method: 'GET',
            path: '/api/blogs',
            responses: {
                200: zod_1.z.array(zod_1.z.custom()),
            },
        },
        get: {
            method: 'GET',
            path: '/api/blogs/:slug',
            responses: {
                200: zod_1.z.custom(),
                404: zod_1.z.object({ message: zod_1.z.string() }),
            },
        },
    },
};
function buildUrl(path, params) {
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
