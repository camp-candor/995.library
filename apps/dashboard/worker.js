import * as access from './functions/api/access.js';
import * as alligator from './functions/api/alligator.js';
import * as auth from './functions/api/auth.js';
import * as greetings from './functions/api/greetings.js';
import * as listDatum from './functions/api/listDatum.js';
import * as moon from './functions/api/moon.js';
import * as writeGithub from './functions/api/writeGithub.js';

const API_ROUTES = {
    '/api/access': access,
    '/api/alligator': alligator,
    '/api/auth': auth,
    '/api/greetings': greetings,
    '/api/listDatum': listDatum,
    '/api/moon': moon,
    '/api/writeGithub': writeGithub,
};

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const handler = API_ROUTES[url.pathname];

        if (handler) {
            const context = { request, env, ctx };
            if (request.method === 'GET' && handler.onRequestGet) {
                return handler.onRequestGet(context);
            }
            if (request.method === 'POST' && handler.onRequestPost) {
                return handler.onRequestPost(context);
            }
            if (handler.onRequest) {
                return handler.onRequest(context);
            }
            return new Response('Method Not Allowed', { status: 405 });
        }

        return env.ASSETS.fetch(request);
    },
};

