interface AuthorisationResponse {
	'access_token': string;
	'expires_in': number;
	'refresh_token': string | undefined;
	'scope': string;
	'token_type': 'Bearer';
}

type HTTP_METHOD = 'DELETE' | 'GET' | 'POST';

type JSON = string | number | boolean | null | JSON[] | {
	[key: string]: JSON;
};

interface Page<T> {
	'href': string;
	'items': T[];
	'limit': number;
	'next': string | null;
	'offset': number;
	'previous': string | null;
	'total': number;
}

export async function api<T>(token: string, method: HTTP_METHOD, endpoint: string, payload?: JSON): Promise<T> | never {
	return await json(
		method,
		new URL(endpoint, 'https://api.spotify.com/v1/'),
		{
			'Authorization': `Bearer ${token}`,
			'Content-Type': 'application/json',
		},
		payload ? JSON.stringify(payload) : undefined,
	) as unknown as T;
}

export async function auth(params: URLSearchParams): Promise<AuthorisationResponse> | never {
	return await json(
		'POST',
		new URL('https://accounts.spotify.com/api/token'),
		{
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		params,
	) as unknown as AuthorisationResponse;
}

export async function pull<T>(token: string, method: HTTP_METHOD, endpoint: string, offset = 0): Promise<T[]> | never {
	const params = new URLSearchParams({
		'limit': '50',
		'offset': String(offset),
	});

	const data = await api<Page<T>>(token, method, `${endpoint}?${params}`);

	if (data.next) return [...data.items, ...await pull<T>(token, method, endpoint, data.offset + data.limit)];
	else return data.items;
}

export async function push<T>(token: string, method: HTTP_METHOD, endpoint: string, key: string, payload: JSON[]): Promise<T> {
	const response = await api<T>(token, method, endpoint, {
		[key]: payload.slice(0, 100),
	});

	if (payload.length > 100) return await push<T>(token, method, endpoint, key, payload.slice(100, payload.length));
	else return response;
}

async function json(method: HTTP_METHOD, url: URL, headers: HeadersInit, body?: BodyInit): Promise<JSON> | never {
	let response: Response;

	try {
		response = await fetch(url, {
			'method': method,
			'headers': {
				'Accept': 'application/json',
				...headers,
			},
			...(body ? { 'body': body } : {}),
		});
	} catch {
		throw new FetchError(503, method, url.toString());
	}

	if (response.ok) return await response.json() as JSON;
	else throw new FetchError(response.status, method, response.url);
}

class FetchError extends Error {
	constructor(status: number, method: HTTP_METHOD, url: string) {
		super(`Fetch request failed with status ${status}. URL: ${method} ${url}`);
		this.name = this.constructor.name;
	}
}
