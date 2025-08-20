import type { Credentials } from '../common/types.ts';
import type { Context } from '../routes/base.routes.ts';

import * as spotify from '../services/spotify.services.ts';

const DENO_ORIGIN = Deno.env.get('DENO_ORIGIN') ?? '';

export async function playlists(_: Request, context: Context): Promise<Response> {
	const credentials = context.session.get<Credentials>('credentials');
	if (!credentials?.token) return Response.redirect(new URL('/auth', DENO_ORIGIN));

	return Response.json(await spotify.getPlaylists(credentials.token));
}
