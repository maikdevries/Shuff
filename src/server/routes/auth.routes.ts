import type { RouteContext } from '@maikdevries/server-router';
import { route } from '@maikdevries/server-router';

import type { BaseContext } from '../middleware/base.middleware.ts';

import * as auth from '../controllers/auth.controllers.ts';

export type Context = RouteContext<BaseContext>;

const router = route<BaseContext>(
	[
		{
			'method': ['GET'],
			'pattern': new URLPattern({ 'pathname': '/auth/setup' }),
			'handler': auth.setup,
		},
		{
			'method': ['GET'],
			'pattern': new URLPattern({ 'pathname': '/auth/process' }),
			'handler': auth.process,
		},
		{
			'method': ['GET'],
			'pattern': new URLPattern({ 'pathname': '/auth/refresh' }),
			'handler': auth.refresh,
		},
		{
			'method': ['GET'],
			'pattern': new URLPattern({ 'pathname': '/auth/logout' }),
			'handler': auth.logout,
		},
	],
	() => new Response('Not found', { 'status': 404 }),
);

export default router;
