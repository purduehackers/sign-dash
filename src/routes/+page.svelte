<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageServerData } from './$types';

	let { data }: { data: PageServerData } = $props();
</script>

<h1>Sign Dash</h1>
{#if data.error}
	<p class="text-red-600">{data.error}</p>
{/if}
<form method="post" action="?/signIn" use:enhance>
	<button class="rounded-md bg-amber-600 px-4 py-2 text-white transition hover:bg-amber-700"
		>Sign in with Purdue Hackers ID</button
	>
</form>
