import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { auth } from '$lib/server/auth';

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		if ((event.locals.user as Record<string, unknown>).role === 'Admin') {
			return redirect(302, '/dashboard');
		}
		return { error: 'You do not have permission to access the dashboard.' };
	}
	return {};
};

export const actions: Actions = {
	signIn: async (event) => {
		const result = await auth.api.signInWithOAuth2({
			body: {
				providerId: 'purduehackers-id',
				callbackURL: '/dashboard'
			}
		});

		if (result.url) {
			return redirect(302, result.url);
		}
		return fail(400, { message: 'Sign-in failed' });
	}
};
