import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { auth } from '$lib/server/auth';
import {
	getConnectedDevices,
	getWifiNetworks,
	setWifiNetworks,
	type WifiNetwork
} from '$lib/server/sign-api';

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) {
		return redirect(302, '/');
	}
	if ((event.locals.user as Record<string, unknown>).role !== 'Admin') {
		return redirect(302, '/');
	}

	const devices = await getConnectedDevices();

	const deviceNetworks: Record<string, WifiNetwork[]> = {};
	for (const device of devices) {
		const result = await getWifiNetworks(device);
		deviceNetworks[device] = 'networks' in result ? result.networks : [];
	}

	return { user: event.locals.user, devices, deviceNetworks };
};

export const actions: Actions = {
	signOut: async (event) => {
		await auth.api.signOut({
			headers: event.request.headers
		});
		return redirect(302, '/');
	},
	addNetwork: async ({ request }) => {
		const form = await request.formData();
		const device = form.get('device')?.toString();
		const ssid = form.get('ssid')?.toString().trim();
		const password = form.get('password')?.toString() ?? '';
		const network_type =
			(form.get('network_type')?.toString() as 'personal' | 'enterprise') ?? 'personal';
		const enterprise_email = form.get('enterprise_email')?.toString().trim() || undefined;
		const enterprise_username = form.get('enterprise_username')?.toString().trim() || undefined;

		if (!device) return fail(400, { addError: 'Device is required' });
		if (!ssid) return fail(400, { addError: 'SSID is required' });

		const current = await getWifiNetworks(device);
		const networks = 'networks' in current ? current.networks : [];
		networks.push({ ssid, password, network_type, enterprise_email, enterprise_username });

		const result = await setWifiNetworks(device, networks);
		if ('error' in result) {
			return fail(502, { addError: result.error });
		}
	},
	removeNetwork: async ({ request }) => {
		const form = await request.formData();
		const device = form.get('device')?.toString();
		const index = Number(form.get('index'));

		if (!device) return fail(400, { removeError: 'Device is required' });

		const current = await getWifiNetworks(device);
		const networks = 'networks' in current ? current.networks : [];
		networks.splice(index, 1);

		const result = await setWifiNetworks(device, networks);
		if ('error' in result) {
			return fail(502, { removeError: result.error });
		}
	}
};
