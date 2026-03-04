import { env } from '$env/dynamic/private';

const API_BASE = 'https://api.purduehackers.com';

export interface WifiNetwork {
	ssid: string;
	password: string;
	network_type: 'personal' | 'enterprise';
	enterprise_email?: string;
	enterprise_username?: string;
}

async function parseResponse(res: Response): Promise<any> {
	const text = await res.text();
	try {
		return JSON.parse(text);
	} catch {
		return { error: text || `HTTP ${res.status}` };
	}
}

export async function getConnectedDevices(): Promise<string[]> {
	const res = await fetch(`${API_BASE}/sign/devices`, {
		headers: { Authorization: `Bearer ${env.SIGN_DASH_API_KEY}` }
	});
	const data = await parseResponse(res);
	return data.devices ?? [];
}

export async function getWifiNetworks(
	device: string
): Promise<{ networks: WifiNetwork[] } | { error: string }> {
	const res = await fetch(`${API_BASE}/sign/${device}/wifi`, {
		headers: { Authorization: `Bearer ${env.SIGN_DASH_API_KEY}` }
	});
	return parseResponse(res);
}

export async function setWifiNetworks(
	device: string,
	networks: WifiNetwork[]
): Promise<{ ok: true } | { error: string }> {
	const res = await fetch(`${API_BASE}/sign/${device}/wifi`, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${env.SIGN_DASH_API_KEY}`
		},
		body: JSON.stringify({ networks })
	});
	return parseResponse(res);
}
