import { betterAuth } from 'better-auth/minimal';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { genericOAuth } from 'better-auth/plugins';
import { env } from '$env/dynamic/private';
import { getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';

export const auth = betterAuth({
	baseURL: env.ORIGIN,
	secret: env.BETTER_AUTH_SECRET,
	database: drizzleAdapter(db, { provider: 'sqlite' }),
	emailAndPassword: { enabled: true },
	user: {
		additionalFields: {
			role: {
				type: 'string',
				required: false
			}
		}
	},
	plugins: [
		genericOAuth({
			config: [
				{
					providerId: 'purduehackers-id',
					clientId: env.PHID_CLIENT_ID!,
					clientSecret: '0',
					authorizationUrl: 'https://id.purduehackers.com/api/authorize',
					tokenUrl: 'https://id.purduehackers.com/api/token',
					userInfoUrl: 'https://id.purduehackers.com/api/user',
					scopes: ['user:read'],
					authentication: 'post',
					getUserInfo: async (tokens) => {
						const res = await fetch('https://id.purduehackers.com/api/user', {
							headers: { Authorization: `Bearer ${tokens.accessToken}` }
						});
						const profile = await res.json();
						const passport = profile.latest_passport;
						return {
							id: String(profile.sub),
							name: passport
								? `${passport.name} ${passport.surname}`
								: String(profile.sub),
							email: `${profile.sub}@id.purduehackers.com`,
							emailVerified: false,
							image: undefined,
							raw: profile
						};
					},
					mapProfileToUser: (profile) => ({
						role: profile.raw?.role ?? null
					})
				}
			]
		}),
		sveltekitCookies(getRequestEvent) // make sure this is the last plugin in the array
	]
});
